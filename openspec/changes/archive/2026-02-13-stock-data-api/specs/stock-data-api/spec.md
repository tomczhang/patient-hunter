## ADDED Requirements

### Requirement: 股票搜索接口
系统 SHALL 提供 `GET /api/stock/search` 接口，支持按股票代码或公司名称（中英文）搜索美股。

#### Scenario: 英文名称搜索
- **WHEN** 客户端发送 `GET /api/stock/search?q=apple`
- **THEN** 系统 SHALL 调用 Massive API `GET /v3/reference/tickers?search=apple&market=stocks&active=true` 并返回匹配的股票列表，每项包含 `ticker`、`name`（英文）、`nameCN`（中文，如有）、`primaryExchange`

#### Scenario: 股票代码搜索
- **WHEN** 客户端发送 `GET /api/stock/search?q=AAPL`
- **THEN** 系统 SHALL 返回包含 AAPL 的搜索结果

#### Scenario: 中文名称搜索
- **WHEN** 客户端发送 `GET /api/stock/search?q=苹果`
- **THEN** 系统 SHALL 查询本地 StockNameCN 表，返回 nameCN 包含"苹果"的股票列表

#### Scenario: 空查询参数
- **WHEN** 客户端发送 `GET /api/stock/search`（无 q 参数或 q 为空）
- **THEN** 系统 SHALL 返回 400 错误，body 包含 `{ error: "缺少搜索关键词" }`

### Requirement: 股票详情接口
系统 SHALL 提供 `GET /api/stock/[ticker]` 接口，返回单只股票的详细信息。

#### Scenario: 查询已知股票
- **WHEN** 客户端发送 `GET /api/stock/AAPL`
- **THEN** 系统 SHALL 调用 Massive API `GET /v3/reference/tickers/AAPL` 并返回股票详情，包含 `ticker`、`name`、`nameCN`、`description`、`marketCap`、`primaryExchange`、`currencyName`、`homepageUrl`、`logoUrl`

#### Scenario: 中文名自动填充
- **WHEN** 查询的 ticker 在本地 StockNameCN 表中无记录
- **THEN** 系统 SHALL 调用 LLM 将英文公司名翻译为中文，并将结果存入 StockNameCN 表后返回

#### Scenario: 查询不存在的股票
- **WHEN** 客户端发送 `GET /api/stock/XXXYZ`（不存在的 ticker）
- **THEN** 系统 SHALL 返回 404 错误，body 包含 `{ error: "未找到该股票" }`

### Requirement: K 线行情接口
系统 SHALL 提供 `GET /api/stock/[ticker]/bars` 接口，返回指定时间范围内的 OHLC 行情数据。

#### Scenario: 获取日线行情
- **WHEN** 客户端发送 `GET /api/stock/AAPL/bars?timespan=day&from=2025-08-01&to=2026-02-01`
- **THEN** 系统 SHALL 调用 Massive API `GET /v2/aggs/ticker/AAPL/range/1/day/2025-08-01/2026-02-01` 并返回 OHLC bar 数组，每项包含 `o`（开盘）、`h`（最高）、`l`（最低）、`c`（收盘）、`v`（成交量）、`t`（时间戳 ms）

#### Scenario: 获取分钟线行情
- **WHEN** 客户端发送 `GET /api/stock/AAPL/bars?timespan=minute&from=2026-02-12&to=2026-02-12`
- **THEN** 系统 SHALL 调用 Massive API `GET /v2/aggs/ticker/AAPL/range/1/minute/2026-02-12/2026-02-12` 并返回分钟级 OHLC bar 数组

#### Scenario: 缺少必需参数
- **WHEN** 客户端发送 `GET /api/stock/AAPL/bars`（缺少 timespan/from/to）
- **THEN** 系统 SHALL 返回 400 错误，body 包含 `{ error: "缺少必需参数: timespan, from, to" }`

### Requirement: 近 6 个月高点接口
系统 SHALL 提供 `GET /api/stock/[ticker]/high` 接口，返回近 6 个月的最高价及对应日期。

#### Scenario: 获取 6 个月高点
- **WHEN** 客户端发送 `GET /api/stock/AAPL/high`
- **THEN** 系统 SHALL 查询近 6 个月的日线数据，计算最高价（使用 adjusted=true），返回 `{ ticker, highPrice, highDate, currentPrice }`

#### Scenario: 无数据可用
- **WHEN** 查询的 ticker 近 6 个月无交易数据
- **THEN** 系统 SHALL 返回 404 错误，body 包含 `{ error: "该股票近 6 个月无交易数据" }`
