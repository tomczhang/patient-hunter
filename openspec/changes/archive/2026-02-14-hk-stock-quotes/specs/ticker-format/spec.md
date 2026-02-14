## ADDED Requirements

### Requirement: ticker 格式识别
系统 SHALL 通过 `isHK(ticker)` 判断是否为港股 ticker（以 `.HK` 结尾，不区分大小写）。

#### Scenario: 港股 ticker
- **WHEN** 输入 "0700.HK" 或 "700.hk"
- **THEN** `isHK()` 返回 `true`

#### Scenario: 美股 ticker
- **WHEN** 输入 "AAPL" 或 "BRK.B"
- **THEN** `isHK()` 返回 `false`

### Requirement: ticker 格式转换
系统 SHALL 提供 `toYahoo()`、`toLongPort()`、`toMassive()` 三个转换函数。

#### Scenario: toYahoo 港股补零
- **WHEN** 输入 "700.HK"
- **THEN** 返回 "0700.HK"（四位补零）

#### Scenario: toYahoo 美股
- **WHEN** 输入 "aapl"
- **THEN** 返回 "AAPL"（大写）

#### Scenario: toLongPort 去前导零
- **WHEN** 输入 "0700.HK"
- **THEN** 返回 "700.HK"

#### Scenario: toMassive
- **WHEN** 输入 "AAPL"
- **THEN** 返回 "AAPL"（纯大写 ticker）
