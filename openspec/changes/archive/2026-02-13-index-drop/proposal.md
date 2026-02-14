## Why

需要一个宽指跌幅判断接口，以组合权重（70% VOO + 30% QQQM）衡量当前大盘距近 6 个月高点的整体跌幅，为后续仓位管理和抄底决策提供数据支撑。

## What Changes

- 在 `lib/stock/service.ts` 新增 `getIndexDrop()` 方法，并发获取 VOO / QQQM 各自的 6 个月高点跌幅，加权计算组合跌幅
- 新增 API 路由 `GET /api/stock/index-drop`，返回 VOO、QQQM 的跌幅明细及加权组合跌幅
- 在 `lib/api-registry.ts` 中注册新端点，使其在 API Tester 页面可测试

## Capabilities

### New Capabilities
- `index-drop`: 宽指组合跌幅计算接口（70% VOO + 30% QQQM），复用现有 `getSixMonthHigh` 逻辑

### Modified Capabilities

## Impact

- `lib/stock/service.ts` — 新增 `getIndexDrop` 导出函数
- `lib/stock/types.ts` — 新增 `IndexDrop` 类型
- `app/api/stock/index-drop/route.ts` — 新 API 路由
- `lib/api-registry.ts` — 新增端点注册
