## ADDED Requirements

### Requirement: 股票详情统一使用 yahoo-finance2
系统 SHALL 通过 yahoo-finance2 的 `quoteSummary()` 接口获取股票公司详情，覆盖美股和港股。

#### Scenario: 查询美股详情
- **WHEN** 请求 `/api/stock/AAPL`
- **THEN** 返回 Apple 的公司详情，包括公司名、简介、行业、市值等

#### Scenario: 查询港股详情
- **WHEN** 请求 `/api/stock/0700.HK`
- **THEN** 返回腾讯的公司详情，包括公司名、简介、行业、市值等

#### Scenario: 查询不存在的股票
- **WHEN** 请求一个不存在的 ticker
- **THEN** 返回 404 错误 `{error: "未找到该股票"}`

### Requirement: 详情接口不包含实时行情
系统 SHALL NOT 在详情接口中返回实时价格数据。行情数据由独立的 quote 接口提供。

#### Scenario: 详情响应不含价格字段
- **WHEN** 请求股票详情
- **THEN** 响应中不包含 `currentPrice`、`lastPrice` 等实时价格字段

### Requirement: 港股详情补充中文名
系统 SHALL 对港股详情自动补充中文名：优先从 StockNameCN 缓存获取，缓存未命中时调用 LongPort `staticInfo()` 获取 `nameCn` 并缓存。

#### Scenario: 港股中文名从 LongPort 获取并缓存
- **WHEN** 请求港股详情且 StockNameCN 无缓存
- **THEN** 调用 LongPort `staticInfo()` 获取中文名，返回给用户，并缓存到 StockNameCN 表（source="longport"）

#### Scenario: 港股中文名命中缓存
- **WHEN** 请求港股详情且 StockNameCN 已有缓存
- **THEN** 直接使用缓存中文名，不调用 LongPort

### Requirement: 美股详情保留 LLM 翻译中文名
系统 SHALL 对美股详情保留现有逻辑：优先查 StockNameCN 缓存，未命中时用 LLM 翻译英文名并缓存。

#### Scenario: 美股中文名翻译并缓存
- **WHEN** 请求美股详情且 StockNameCN 无缓存
- **THEN** 使用 LLM 翻译公司英文名为中文，缓存到 StockNameCN 表（source="llm"）
