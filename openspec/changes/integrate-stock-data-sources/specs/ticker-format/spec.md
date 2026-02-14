## ADDED Requirements

### Requirement: 内部统一使用 Yahoo 格式
系统 SHALL 以 Yahoo Finance 格式作为内部标准 ticker 格式：美股 `"AAPL"`，港股 `"0700.HK"`。

#### Scenario: 搜索结果使用 Yahoo 格式
- **WHEN** yahoo-finance2 搜索返回结果
- **THEN** ticker 直接使用 Yahoo 格式，无需转换

#### Scenario: 数据库存储使用 Yahoo 格式
- **WHEN** 缓存中文名到 StockNameCN 表
- **THEN** ticker 字段使用 Yahoo 格式（如 `"0700.HK"`）

### Requirement: 调用 LongPort 时转换 ticker 格式
系统 SHALL 在调用 LongPort API 时将 Yahoo 格式转换为 LongPort 格式：去掉港股代码前导零。

#### Scenario: Yahoo 转 LongPort 格式
- **WHEN** 内部 ticker 为 `"0700.HK"`
- **THEN** 转换为 `"700.HK"` 传入 LongPort API

#### Scenario: 四位及以上港股代码不去零
- **WHEN** 内部 ticker 为 `"9988.HK"`
- **THEN** 转换为 `"9988.HK"`（无前导零，不变）

### Requirement: 市场判断基于 ticker 后缀
系统 SHALL 通过 ticker 后缀判断市场归属。

#### Scenario: 港股识别
- **WHEN** ticker 以 `.HK` 结尾
- **THEN** 判定为港股

#### Scenario: 默认为美股
- **WHEN** ticker 不含 `.` 或后缀非 `.HK`
- **THEN** 判定为美股
