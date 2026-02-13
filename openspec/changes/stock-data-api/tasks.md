## 1. 类型定义与基础设施

- [x] 1.1 创建 `lib/stock/types.ts` — Massive API 响应类型和业务类型定义
- [x] 1.2 创建 `lib/stock/client.ts` — Massive HTTP 客户端封装（认证、错误处理、4 个 API 调用方法）
- [x] 1.3 创建 `lib/stock/service.ts` — 业务逻辑层（6 个月高点计算、中文名称填充）

## 2. 数据库变更

- [x] 2.1 在 `prisma/schema.prisma` 中新增 `StockNameCN` 模型
- [x] 2.2 运行 `prisma db push` 同步数据库结构
- [x] 2.3 创建 `prisma/seed.ts` — TOP 100 热门美股中文名称种子数据
- [x] 2.4 在 `package.json` 中添加 `db:seed` 脚本

## 3. API 路由实现

- [x] 3.1 创建 `app/api/stock/search/route.ts` — 股票搜索接口（中英文分流）
- [x] 3.2 创建 `app/api/stock/[ticker]/route.ts` — 股票详情接口（含中文名自动翻译）
- [x] 3.3 创建 `app/api/stock/[ticker]/bars/route.ts` — K 线行情接口（分钟线/日线）
- [x] 3.4 创建 `app/api/stock/[ticker]/high/route.ts` — 近 6 个月高点接口

## 4. 前端改造

- [x] 4.1 修改 `components/dashboard/AddAssetForm.tsx` — 替换 MOCK_STOCKS 为异步 API 搜索（防抖 300ms + loading + 错误处理）
- [x] 4.2 更新 `lib/constants.ts` — 移除 MOCK_STOCKS

## 5. 验证

- [x] 5.1 运行 build 确认无编译错误
- [x] 5.2 验证 4 个 API 端点返回正确数据
