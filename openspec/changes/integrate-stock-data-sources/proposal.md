## Why

当前股票数据仅依赖 Massive API，只覆盖美股，不支持港股搜索与详情。项目需要同时支持美股和港股的搜索、详情、行情三大场景，且港股行情必须实时（不接受 15 分钟延迟）。

## What Changes

- 引入 `yahoo-finance2` 作为股票搜索与公司详情的统一数据源（覆盖 US + HK）
- 引入 `longport` SDK 作为港股实时行情数据源
- 保留 `Massive API` 作为美股行情数据源
- 将现有 `lib/stock/client.ts` 拆分为三个独立数据源客户端
- 新增 ticker 格式转换工具（Yahoo `0700.HK` ↔ LongPort `700.HK` ↔ Massive `AAPL`）
- 新增 `/api/stock/[ticker]/quote` 接口提供实时行情
- 改造 `/api/stock/search` 接口使用 yahoo-finance2 支持全球搜索
- 改造 `/api/stock/[ticker]` 接口使用 yahoo-finance2 提供丰富公司详情

## Capabilities

### New Capabilities
- `stock-search`: 基于 yahoo-finance2 的统一股票搜索（US + HK），替代原 Massive 搜索
- `stock-detail`: 基于 yahoo-finance2 的股票公司详情（公司简介、财务数据、行业分类等）
- `stock-quote`: 实时行情接口，港股走 LongPort，美股走 Massive
- `ticker-format`: ticker 格式在不同数据源间的转换工具

### Modified Capabilities

## Impact

- **依赖变更**: 新增 `yahoo-finance2`、`longport` npm 包
- **文件变更**: `lib/stock/client.ts` 重命名为 `massive.ts`，新增 `yahoo.ts`、`longport.ts`、`ticker.ts`
- **API 变更**: `/api/stock/search` 响应字段可能调整；新增 `/api/stock/[ticker]/quote` 路由
- **环境变量**: 需要 `LONGPORT_APP_KEY`、`LONGPORT_APP_SECRET`、`LONGPORT_ACCESS_TOKEN`（已配置）
- **类型变更**: `lib/stock/types.ts` 需扩展以适配新数据源字段
