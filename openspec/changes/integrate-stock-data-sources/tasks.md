## 1. 依赖与基础设施

- [ ] 1.1 安装 `yahoo-finance2` 和 `longport` npm 依赖
- [ ] 1.2 创建 `lib/stock/ticker.ts` — ticker 格式转换工具（isHK、toYahoo、toLongPort、toMassive）
- [ ] 1.3 将 `lib/stock/client.ts` 重命名为 `lib/stock/massive.ts`，更新所有引用

## 2. yahoo-finance2 集成（搜索 + 详情）

- [ ] 2.1 创建 `lib/stock/yahoo.ts` — 封装 yahoo-finance2 的 search 和 quoteSummary
- [ ] 2.2 改造 `lib/stock/service.ts` 的 `searchStocks()` — 使用 yahoo.search 替代 Massive 搜索，保留中文搜索走本地 DB
- [ ] 2.3 改造 `lib/stock/service.ts` 的 `getStockDetail()` — 使用 yahoo.quoteSummary 替代 Massive getTickerDetail
- [ ] 2.4 扩展 `lib/stock/types.ts` — 新增 yahoo 响应类型和调整 StockDetail 字段

## 3. LongPort 集成（港股行情）

- [ ] 3.1 创建 `lib/stock/longport.ts` — QuoteContext 单例 + 懒初始化 + quote/candlesticks 封装
- [ ] 3.2 在 `lib/stock/service.ts` 新增 `getStockQuote()` — 根据 ticker 后缀自动路由到 LongPort 或 Massive
- [ ] 3.3 扩展 `lib/stock/types.ts` — 新增 StockQuote 统一行情类型

## 4. API 路由

- [ ] 4.1 改造 `app/api/stock/search/route.ts` — 适配新的 searchStocks 返回格式
- [ ] 4.2 改造 `app/api/stock/[ticker]/route.ts` — 适配新的 getStockDetail 返回格式
- [ ] 4.3 新增 `app/api/stock/[ticker]/quote/route.ts` — 实时行情接口

## 5. 中文名缓存

- [ ] 5.1 港股中文名：在详情流程中调用 LongPort staticInfo 获取 nameCn 并缓存到 StockNameCN（source="longport"）
- [ ] 5.2 美股中文名：保留现有 LLM 翻译 + 缓存逻辑不变
