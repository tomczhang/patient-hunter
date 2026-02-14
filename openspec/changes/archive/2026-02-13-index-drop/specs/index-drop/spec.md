## ADDED Requirements

### Requirement: 宽指组合跌幅计算
系统 SHALL 提供 `GET /api/stock/index-drop` 接口，并发获取 VOO 和 QQQM 近 6 个月各自距高点的跌幅，按 70% VOO + 30% QQQM 计算加权组合跌幅，返回明细和组合结果。

#### Scenario: 正常返回组合跌幅
- **WHEN** 客户端请求 `GET /api/stock/index-drop`
- **THEN** 响应 200，body 包含 `voo`（含 ticker/highPrice/highDate/currentPrice/dropFromHigh）、`qqqm`（同结构）、`combinedDrop`（加权百分比，保留两位小数）、`weights`（{ voo: 0.7, qqqm: 0.3 }）

#### Scenario: VOO 或 QQQM 无数据
- **WHEN** VOO 或 QQQM 任一在近 6 个月无交易数据
- **THEN** 响应 404，返回 `{ error: "无法获取宽指数据" }`

#### Scenario: Massive API 调用失败
- **WHEN** Massive API 请求出错
- **THEN** 响应 500，返回 `{ error: "<错误信息>" }`
