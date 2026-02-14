## Context

已有 `getSixMonthHigh(ticker)` 方法可获取任意 ticker 近 6 个月最高价及当前价距高点的跌幅百分比。需要将 VOO（S&P 500 ETF）和 QQQM（Nasdaq 100 ETF）的跌幅按 70:30 权重合成为一个组合跌幅指标。

## Goals / Non-Goals

**Goals:**
- 提供 `GET /api/stock/index-drop` 接口，返回 VOO、QQQM 各自的 6 个月高点数据及加权组合跌幅
- 并发请求 VOO + QQQM 数据，减少接口延迟

**Non-Goals:**
- 不支持自定义权重或自定义 ticker 组合（后续扩展）
- 不做缓存（当前请求量低，直接调用 Massive API）

## Decisions

1. **组合公式**：`combinedDrop = 0.7 × VOO.dropFromHigh + 0.3 × QQQM.dropFromHigh`
2. **并发获取**：使用 `Promise.all` 同时请求两只 ETF，减少响应时间
3. **复用 `getSixMonthHigh`**：不新写 K 线获取逻辑，完全复用现有方法
4. **新增 `IndexDrop` 类型**：包含 VOO 明细、QQQM 明细和组合跌幅

## Risks / Trade-offs

- [Massive API 速率限制] → 每次调用会触发 2 次 K 线请求；当前无需缓存，量大时需加 Redis
- [VOO/QQQM 硬编码] → 当前需求明确，后续可参数化
