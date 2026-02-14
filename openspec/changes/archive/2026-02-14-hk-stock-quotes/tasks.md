## 1. 清理与基础设施

- [x] 1.1 清理残留的 `lib/stock/massive.ts`（与 `client.ts` 重复）
- [x] 1.2 移除 `yahoo-finance2` 依赖
- [x] 1.3 创建 `lib/stock/ticker.ts` — ticker 格式转换工具（isHK、toYahoo、toLongPort、toMassive）

## 2. 港股 seed 数据

- [x] 2.1 在 `prisma/seed.ts` 中新增 ~50 只常用港股的中文名映射（恒指成分股 + 热门股）
- [x] 2.2 执行 seed 导入港股数据

## 3. LongPort 客户端

- [x] 3.1 创建 `lib/stock/longport.ts` — 动态 import + QuoteContext 单例 + quote/staticInfo 封装

## 4. 搜索改造

- [x] 4.1 改造 `service.ts` 的 `searchStocks()` — 英文搜索先查本地 DB 再查 Massive，中文搜索查本地 DB

## 5. 详情改造

- [x] 5.1 改造 `service.ts` 的 `getStockDetail()` — 港股走 LongPort staticInfo，美股保持 Massive
- [x] 5.2 扩展 `types.ts` — StockDetail 新增 lotSize 字段，新增 StockQuote 类型

## 6. 实时行情

- [x] 6.1 在 `service.ts` 新增 `getStockQuote()` — 港股走 LongPort quote，美股走 Massive bars
- [x] 6.2 新增 `app/api/stock/[ticker]/quote/route.ts` — 实时行情 API 路由
