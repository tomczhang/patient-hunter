## ADDED Requirements

### Requirement: 统一实时行情接口
系统 SHALL 提供 `GET /api/stock/[ticker]/quote` 接口，根据 ticker 后缀自动路由到对应数据源。

#### Scenario: 港股实时行情
- **WHEN** 请求 `GET /api/stock/0700.HK/quote`
- **THEN** 调用 LongPort `quote()` 返回 `{ ticker, lastPrice, change, changePercent, open, high, low, volume, timestamp }`

#### Scenario: 美股实时行情
- **WHEN** 请求 `GET /api/stock/AAPL/quote`
- **THEN** 调用 Massive API 获取最近交易日数据，返回相同格式的行情

#### Scenario: 不存在的 ticker
- **WHEN** 请求不存在的 ticker 行情
- **THEN** 返回 404

### Requirement: LongPort 动态加载
系统 SHALL 使用动态 `import("longport")` 加载原生模块，避免在不需要港股行情的路由中触发 native binding。

#### Scenario: 搜索接口不加载 LongPort
- **WHEN** 请求 `/api/stock/search`
- **THEN** 不触发 LongPort native binding 加载

### Requirement: LongPort QuoteContext 单例
系统 SHALL 使用单例模式管理 QuoteContext，异常时自动重置。

#### Scenario: 连续两次港股行情请求
- **WHEN** 连续请求两次港股行情
- **THEN** 复用同一个 QuoteContext 连接

#### Scenario: LongPort 连接异常
- **WHEN** QuoteContext 抛出异常
- **THEN** 重置单例，下次请求重新建立连接
