## ADDED Requirements

### Requirement: 统一搜索覆盖美股和港股
系统 SHALL 通过 yahoo-finance2 的 `search()` 接口提供统一的股票搜索，覆盖美股和港股市场。

#### Scenario: 英文关键词搜索美股
- **WHEN** 用户搜索 `q=AAPL`
- **THEN** 返回包含 `AAPL` 的美股搜索结果，含 ticker、英文名、交易所信息

#### Scenario: 英文关键词搜索港股
- **WHEN** 用户搜索 `q=tencent`
- **THEN** 返回包含 `0700.HK` 的港股搜索结果

#### Scenario: 纯数字搜索港股代码
- **WHEN** 用户搜索 `q=700`
- **THEN** 系统 SHALL 将其作为可能的港股代码进行搜索，返回 `0700.HK` 相关结果

### Requirement: 中文关键词搜索走本地数据库
系统 SHALL 对中文关键词优先查询本地 StockNameCN 表，覆盖已缓存的美股和港股中文名。

#### Scenario: 中文搜索已缓存的港股
- **WHEN** 用户搜索 `q=腾讯`，且 StockNameCN 表中已有 `0700.HK` 的中文名记录
- **THEN** 返回匹配结果 `{ticker: "0700.HK", nameCN: "腾讯控股"}`

#### Scenario: 中文搜索无缓存记录
- **WHEN** 用户搜索中文关键词，但 StockNameCN 表无匹配
- **THEN** 返回空结果数组

### Requirement: 搜索结果格式统一
系统 SHALL 返回统一格式的搜索结果，无论数据来源是 Yahoo 还是本地 DB。

#### Scenario: 搜索结果包含必要字段
- **WHEN** 搜索返回结果
- **THEN** 每条结果 SHALL 包含 `ticker`、`name`、`primaryExchange` 字段，`nameCN` 为可选字段
