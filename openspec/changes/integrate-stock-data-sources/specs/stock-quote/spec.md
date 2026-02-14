## ADDED Requirements

### Requirement: 港股行情使用 LongPort 实时数据
系统 SHALL 通过 LongPort SDK 的 `quote()` 方法获取港股实时行情。

#### Scenario: 获取港股实时报价
- **WHEN** 请求 `/api/stock/0700.HK/quote`
- **THEN** 返回腾讯的实时行情数据，包括最新价、涨跌幅、成交量等

#### Scenario: LongPort 连接懒初始化
- **WHEN** 首次请求港股行情
- **THEN** 系统自动初始化 LongPort QuoteContext 单例连接，后续请求复用

### Requirement: 美股行情继续使用 Massive API
系统 SHALL 对美股行情保持现有 Massive API 调用逻辑不变。

#### Scenario: 获取美股报价
- **WHEN** 请求 `/api/stock/AAPL/quote`
- **THEN** 通过 Massive API 返回 AAPL 的行情数据

### Requirement: 行情接口自动路由
系统 SHALL 根据 ticker 格式自动路由到对应数据源：`.HK` 后缀走 LongPort，其他走 Massive。

#### Scenario: 港股 ticker 路由到 LongPort
- **WHEN** ticker 为 `0700.HK`
- **THEN** 行情请求路由到 LongPort

#### Scenario: 美股 ticker 路由到 Massive
- **WHEN** ticker 为 `AAPL`
- **THEN** 行情请求路由到 Massive

### Requirement: 宽指跌幅接口保持不变
`/api/stock/index-drop` 接口 SHALL 继续使用 Massive API 获取 VOO/QQQM 行情，逻辑不变。

#### Scenario: index-drop 不受影响
- **WHEN** 请求 `/api/stock/index-drop`
- **THEN** 继续通过 Massive API 计算 VOO + QQQM 加权跌幅
