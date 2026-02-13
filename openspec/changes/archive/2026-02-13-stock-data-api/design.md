## Context

当前项目使用硬编码的 `MOCK_STOCKS` 数组作为股票搜索数据源，只有 11 只预设股票。需要接入 Massive REST API（`api.massive.com`）获取实时美股数据。API Key 已配置在 `.env` 中（`MASSIVE_API_KEY`）。

项目已有 `lib/ai/client.ts` 作为 OpenAI 客户端封装的参考模式，新的 stock 模块应遵循相同的封装风格。

## Goals / Non-Goals

**Goals:**
- 封装 Massive REST API 客户端，提供 4 个核心能力（搜索、详情、行情、高点）
- 支持中英文双语搜索和名称展示
- 替换 `AddAssetForm` 中的 `MOCK_STOCKS` 为真实 API 调用
- 预填充 TOP 100 热门美股中文名称

**Non-Goals:**
- 不实现港股/A 股数据接入（仅美股）
- 不实现 WebSocket 实时推送
- 不实现数据缓存到 PostgreSQL（第一版直接穿透到 Massive API）
- 不实现 rate limiting（后续需要时再加）

## Decisions

### 1. HTTP 客户端封装方式

**选择**: 独立的 `lib/stock/client.ts` 模块，使用 class 封装

**理由**: 与 `lib/ai/client.ts` 保持一致的模式。使用 class 可以封装 apiKey、baseUrl、通用错误处理。

**替代方案**: 直接在 route.ts 中调用 fetch — 不可复用，代码重复。

### 2. 认证方式

**选择**: HTTP Header `Authorization: Bearer <key>`

**理由**: 比 query param `?apiKey=xxx` 更安全，不会泄露到 URL 日志中。

### 3. 中文名称映射策略

**选择**: PostgreSQL 本地映射表 + LLM 翻译兜底

- `StockNameCN` 模型存储 ticker ↔ 中文名称
- 预填充 TOP 100 热门美股（seed 脚本）
- 首次查询未知 ticker 时，调用 GPT 翻译英文公司名并缓存
- 中文搜索只查本地 DB（Massive API 不支持中文）

**替代方案**: 纯 LLM 实时翻译 — 延迟太高（1-2s），且无法支持中文搜索。

### 4. API 路由结构

```
app/api/stock/
  search/route.ts          GET /api/stock/search?q=xxx
  [ticker]/route.ts        GET /api/stock/AAPL
  [ticker]/bars/route.ts   GET /api/stock/AAPL/bars?timespan=day&from=2025-01-01&to=2025-06-01
  [ticker]/high/route.ts   GET /api/stock/AAPL/high
```

**理由**: 使用 Next.js 动态路由 `[ticker]`，符合 RESTful 风格。

### 5. 6 个月高点计算

**选择**: 服务端计算（`lib/stock/service.ts`）

- 调用 Custom Bars API，`timespan=day`，范围=近 6 个月
- 遍历所有日线 bar，找 `max(h)` 及对应时间戳
- 使用 `adjusted=true`（除权后价格）

### 6. AddAssetForm 异步搜索

**选择**: 防抖 300ms + loading 状态 + 错误处理

- 输入超过 1 个字符后开始搜索
- 300ms 防抖避免频繁调用
- 搜索中显示 loading 指示
- 网络失败时显示错误提示

## Risks / Trade-offs

- **[Rate Limiting]** Massive API 有请求频率限制 → 第一版不处理，后续可加客户端缓存
- **[分钟线数据量]** 分钟线数据量大 → 前端应限制查询范围（建议最多 5 天）
- **[LLM 翻译准确性]** GPT 可能翻译不准 → 用户可通过 DB 手动修正；seed 数据保证热门股正确
- **[冷启动]** 映射表初始只有 seed 数据 → 用户搜索英文/ticker 时自动积累中文名
- **[Massive API 可用性]** API 不可用时搜索失败 → 返回友好错误信息，不影响已有功能
