## Why

现有系统只支持美股（Massive API），无法搜索和获取港股数据。需要增加港股支持，使用 LongPort OpenAPI 获取港股实时行情。同时废弃 yahoo-finance2 方案（不返回 ticker、不支持中文搜索），改为预置常用港股中文名映射 + LongPort 行情的轻量方案。

## What Changes

- 在 seed 数据中新增常用港股的中文名 ↔ ticker 映射（如 `0700.HK` → 腾讯）
- 新增 LongPort 客户端封装（动态加载，懒初始化 QuoteContext 单例）
- 新增 ticker 格式转换工具（`isHK`、`toLongPort`、`toYahoo` 等）
- 改造 `searchStocks()`：中文搜索走本地 DB（含港股），英文搜索美股走 Massive、港股走本地 DB
- 改造 `getStockDetail()`：港股详情走 LongPort staticInfo
- 新增实时行情接口：港股走 LongPort，美股走 Massive
- 中文搜索找不到预置股票时，返回明确错误提示
- 移除 `yahoo-finance2` 依赖

## Capabilities

### New Capabilities
- `hk-stock-search`: 港股搜索能力（基于预置的中文名 ↔ ticker 映射）
- `hk-stock-detail`: 港股详情（LongPort staticInfo）
- `stock-quote`: 统一实时行情接口（港股 LongPort / 美股 Massive）
- `ticker-format`: ticker 格式转换工具

### Modified Capabilities
<!-- 无需修改现有 spec -->

## Impact

- **新依赖**: `longport`（已安装）
- **移除依赖**: `yahoo-finance2`
- **数据库**: `StockNameCN` 表新增港股 seed 数据
- **API 路由**: 新增 `/api/stock/[ticker]/quote`
- **现有 API**: `/api/stock/search` 和 `/api/stock/[ticker]` 行为调整（支持港股）
- **文件变更**: `lib/stock/` 下新增 `longport.ts`、`ticker.ts`，改造 `service.ts`、`types.ts`
