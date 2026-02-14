## Context

当前 `lib/stock/client.ts` 仅封装了 Massive API，只支持美股数据。项目需要同时覆盖美股和港股。用户决策：
- 股票详情（公司信息、财务）：统一用 yahoo-finance2
- 港股行情（实时价格、K线）：用 LongPort SDK
- 美股行情：继续用 Massive API

三个数据源的 ticker 格式不同：Yahoo 用 `0700.HK`，LongPort 用 `700.HK`，Massive 用 `AAPL`（无后缀）。

## Goals / Non-Goals

**Goals:**
- 搜索接口统一覆盖美股 + 港股
- 详情接口提供丰富的公司信息（财务、行业、简介等）
- 港股行情实时，不接受延迟
- 美股行情保持现有 Massive API 不变
- 架构清晰：按数据源拆分客户端文件

**Non-Goals:**
- 不做 A 股支持
- 不做 yahoo-finance2 行情（延迟 15 分钟不可接受）
- 不做全量港股列表同步到本地 DB
- 不做 WebSocket 实时推送到前端

## Decisions

### 1. 数据源职责划分

| 职责 | 数据源 | 理由 |
|------|--------|------|
| 搜索 | yahoo-finance2 `search()` | 唯一提供全球模糊搜索的 API |
| 详情 | yahoo-finance2 `quoteSummary()` | 数据最丰富，覆盖 US+HK |
| 港股行情 | LongPort `quote()` / `candlesticks()` | 实时，官方 API |
| 美股行情 | Massive `getBars()` | 现有实现，不变 |

**否决方案**: 全部用 LongPort → 无搜索 API；全部用 yahoo-finance2 → 行情延迟 15 分钟。

### 2. 文件拆分

将 `lib/stock/client.ts` 重命名为 `massive.ts`，新增：
- `yahoo.ts` — yahoo-finance2 封装（搜索 + 详情）
- `longport.ts` — LongPort QuoteContext 封装（港股行情）
- `ticker.ts` — ticker 格式转换工具函数

**理由**: 单一职责，每个文件对应一个数据源，便于独立测试和替换。

### 3. LongPort 连接管理

采用模块级单例 + 懒初始化：
- 首次调用时创建 `QuoteContext`，后续复用
- 冷启动约 200-500ms 额外延迟，可接受
- 使用 `Config.fromEnv()` 读取 `.env` 中的凭证

**否决方案**: 每次请求新建连接 → 延迟太高；连接池 → 过度设计。

### 4. Ticker 格式约定

- 内部统一格式：美股 `"AAPL"`，港股 `"0700.HK"`（与 Yahoo 一致）
- 调用 LongPort 时转换：`"0700.HK"` → `"700.HK"`（去前导零）
- 调用 Massive 时直接使用：`"AAPL"`
- 市场判断：`ticker.endsWith('.HK')` → 港股，否则美股

**理由**: Yahoo 格式覆盖最广，且搜索结果直接返回此格式，减少转换。

### 5. 自动判断搜索市场

搜索时不要求前端传 `market` 参数，后端自动判断：
- 含中文字符 → 本地 DB 模糊搜索（StockNameCN）
- 纯数字 → 同时搜 Yahoo（可能是港股代码）
- 字母/混合 → Yahoo 搜索

### 6. 中文名策略

- yahoo-finance2 搜索结果通常只有英文名
- 港股：调用 LongPort `staticInfo()` 可获取 `nameCn`，按需缓存到 StockNameCN
- 美股：保留现有 LLM 翻译 + 缓存逻辑
- StockNameCN 表的 `source` 字段扩展：`"seed" | "llm" | "manual" | "longport"`

## Risks / Trade-offs

- **[yahoo-finance2 不稳定]** → 非官方 API，Yahoo 可能随时变更。缓解：详情数据缓存到本地，减少调用频率；出错时降级返回缓存数据。
- **[LongPort 冷启动延迟]** → 首次请求 200-500ms。缓解：可接受，用户已确认。
- **[Ticker 格式混乱]** → 三套格式转换容易出错。缓解：集中在 `ticker.ts` 处理，统一入口。
- **[StockNameCN 表复用]** → 美股 ticker 无后缀 `"AAPL"`，港股有后缀 `"0700.HK"`，混在同一张表。缓解：ticker 字段本身可区分，无歧义。
