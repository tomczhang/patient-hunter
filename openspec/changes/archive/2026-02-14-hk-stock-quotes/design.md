## Context

现有系统通过 Massive API 支持美股搜索、详情和 K 线。中文名存储在 `StockNameCN` 表（seed 预置 ~90 条美股）。上一个方案尝试引入 yahoo-finance2 做统一搜索，但发现其 search 接口不返回标准 ticker、不支持中文搜索，故废弃。

LongPort OpenAPI SDK（`longport` npm 包）已安装，环境变量 `LONGPORT_APP_KEY/SECRET/ACCESS_TOKEN` 已配置。LongPort 使用原生 binding（NAPI-RS），必须动态 import 避免在不需要时加载。

## Goals / Non-Goals

**Goals:**
- 支持港股搜索（通过预置的中文名 ↔ ticker 映射）
- 支持港股实时行情（LongPort `quote()`）
- 支持港股基本信息（LongPort `staticInfo()`）
- 统一的实时行情接口，自动根据 ticker 后缀路由
- 清晰的错误提示（中文搜索无结果时）

**Non-Goals:**
- 不做港股全市场搜索（不同步全量港股列表）
- 不做港股 K 线（LongPort candlesticks 暂不接入）
- 不引入 yahoo-finance2
- 不做实时推送（WebSocket subscribe）

## Decisions

### 1. 港股搜索 → 预置映射 + 本地 DB

**选择**: 在 seed 数据中预置 ~50 只常用港股的中文名/英文名/ticker，存入 `StockNameCN` 表。

**理由**: LongPort 无搜索接口（只有 `staticInfo` 精确查询和 `securityList` 全量列表），yahoo-finance2 搜索不返回 ticker。预置映射最轻量、零外部依赖。

**替代方案**: 同步全量港股列表到本地 DB → 太重，维护成本高。

### 2. LongPort 动态加载 + 单例

**选择**: `longport.ts` 内部使用 `await import("longport")` 动态加载，`QuoteContext` 用懒初始化单例。

**理由**: LongPort 是 NAPI-RS 原生模块，顶层 import 会在所有路由加载时触发 binding 解析。动态 import 确保只在港股相关请求时才加载。

### 3. Ticker 格式统一

**选择**: 内部统一使用 Yahoo 格式（港股 `0700.HK` 四位补零），转换函数集中在 `ticker.ts`。

**理由**: 不同 API 格式不同（LongPort `700.HK`，Massive `AAPL`），统一格式避免混乱。

### 4. 搜索策略

**选择**: 
- 中文搜索 → 查 `StockNameCN` 表（覆盖美股 + 港股），无结果时返回错误提示
- 英文搜索 → 先查本地 DB，再查 Massive API（美股），合并结果

**理由**: 保持简单，不引入额外外部搜索依赖。

## Risks / Trade-offs

- **[预置数据有限]** → 通过 seed 覆盖最常用的港股（恒指成分股等），用户可手动扩展
- **[LongPort 冷启动]** → 首次请求约 1-2 秒建立连接，后续复用单例 → 可接受
- **[LongPort 连接中断]** → 异常时 reset 单例，下次请求重建 → 已实现
- **[massive.ts 残留]** → 需清理重复的 `massive.ts`（与 `client.ts` 重复）
