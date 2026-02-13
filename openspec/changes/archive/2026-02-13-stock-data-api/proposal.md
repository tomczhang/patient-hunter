## Why

当前项目的股票搜索功能使用硬编码的 `MOCK_STOCKS` 数据，无法满足真实交易场景的需求。需要接入 Massive REST API 获取实时美股数据，包括股票搜索、详情查询、K 线行情和历史高点计算，同时支持中文名称映射。

## What Changes

- 新增 `lib/stock/` 模块：封装 Massive API HTTP 客户端、TypeScript 类型定义和业务逻辑层
- 新增 4 个 API 路由：
  - `GET /api/stock/search?q=xxx` — 按名称/ticker 搜索股票（支持中英文）
  - `GET /api/stock/[ticker]` — 获取单只股票详情（含中文名）
  - `GET /api/stock/[ticker]/bars?timespan=day&from=...&to=...` — 获取分钟线/日线 OHLC 行情
  - `GET /api/stock/[ticker]/high` — 获取近 6 个月最高价及日期
- 新增 Prisma 模型 `StockNameCN`：本地存储 ticker ↔ 中文名称映射
- 新增 seed 脚本：预填充 TOP 100 热门美股的中文名称
- 新增 LLM 自动翻译兜底：首次查询未知 ticker 时自动翻译英文名并缓存
- **修改** `AddAssetForm` 组件：将同步的 `MOCK_STOCKS` 搜索替换为异步 API 调用（防抖 + loading 状态）

## Capabilities

### New Capabilities
- `stock-data-api`: 封装 Massive REST API 客户端，提供股票搜索、详情、OHLC 行情、历史高点四个核心能力
- `stock-name-cn`: 中文名称映射服务，包含本地 DB 存储、LLM 翻译兜底、种子数据预填充

### Modified Capabilities
- `add-asset-form`: 股票搜索从本地 MOCK_STOCKS 改为异步调用 `/api/stock/search` 接口，需要支持防抖、loading 状态、错误处理

## Impact

- **新增文件**: `lib/stock/client.ts`, `lib/stock/types.ts`, `lib/stock/service.ts`, `prisma/seed.ts`, 4 个 `route.ts`
- **修改文件**: `prisma/schema.prisma`（新增 StockNameCN 模型）, `components/dashboard/AddAssetForm.tsx`, `lib/constants.ts`（可移除 MOCK_STOCKS）, `package.json`（新增 seed 脚本）
- **新增依赖**: 无（使用 Next.js 内置 fetch）
- **环境变量**: `MASSIVE_API_KEY`（已配置）
- **数据库**: 需要运行 migration 添加 StockNameCN 表
