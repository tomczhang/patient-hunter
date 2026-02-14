## ADDED Requirements

### Requirement: 港股详情查询
系统 SHALL 通过 LongPort `staticInfo()` 获取港股基本信息，包括中文名、英文名、交易所、货币、每手股数等。

#### Scenario: 查询已知港股 ticker
- **WHEN** 用户请求 `GET /api/stock/0700.HK`
- **THEN** 返回包含 ticker、name、nameCN、primaryExchange、currencyName、lotSize 等字段的详情

#### Scenario: 查询不存在的港股 ticker
- **WHEN** 用户请求 `GET /api/stock/9999.HK`（不存在）
- **THEN** 返回 404 和错误信息

### Requirement: 港股中文名缓存
系统 SHALL 将 LongPort 返回的中文名缓存到 `StockNameCN` 表（source="longport"），后续请求直接读 DB。

#### Scenario: 首次查询港股详情
- **WHEN** 查询一只未缓存的港股详情
- **THEN** 从 LongPort 获取中文名，写入 `StockNameCN` 表，并返回给用户

#### Scenario: 再次查询同一港股
- **WHEN** 查询已缓存的港股详情
- **THEN** 从 DB 读取中文名，不再调用 LongPort staticInfo
