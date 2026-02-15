## ADDED Requirements

### Requirement: store_db 写入 operation 数据
`store_db` 节点 SHALL 将用户确认的交易记录数据写入 Prisma `Operation` 表。

#### Scenario: 单笔交易写入
- **WHEN** `task = "operation"` 且 confirmedData.rows 包含 1 条 OperationItem
- **THEN** SHALL 在 Operation 表创建 1 条记录，包含 ticker, name, action, quantity, price, currency, tradedAt, memo, portfolioId

#### Scenario: 多笔交易批量写入
- **WHEN** `task = "operation"` 且 confirmedData.rows 包含 N 条 OperationItem
- **THEN** SHALL 在一个 Prisma transaction 中创建 N 条 Operation 记录

#### Scenario: tradedAt 默认填充
- **WHEN** 某条 OperationItem 的 tradedAt 为 null 或空
- **THEN** SHALL 使用当天日期作为 tradedAt 写入

### Requirement: store_db 写入 holding 数据
`store_db` 节点 SHALL 将用户确认的持仓数据写入 Prisma `Holding` 表。

#### Scenario: 单条持仓写入
- **WHEN** `task = "holding"` 且 confirmedData.rows 包含 1 条 HoldingItem
- **THEN** SHALL 在 Holding 表创建 1 条记录，包含 ticker, name, quantity, costPrice, currency, portfolioId

#### Scenario: 多条持仓批量写入
- **WHEN** `task = "holding"` 且 confirmedData.rows 包含 N 条 HoldingItem
- **THEN** SHALL 在一个 Prisma transaction 中创建 N 条 Holding 记录

### Requirement: 批量写入事务性
store_db 的所有数据库操作 SHALL 在单个 Prisma transaction 中执行。

#### Scenario: 部分行数据校验失败
- **WHEN** 批量写入中某一行因数据校验不通过（如 ticker 为空）导致失败
- **THEN** SHALL 整批回滚，不写入任何记录，storeResult.success = false

#### Scenario: 全部写入成功
- **WHEN** 所有行均通过校验并成功写入
- **THEN** SHALL 返回 storeResult = { success: true, ids: [所有新建记录的 id] }

### Requirement: 写入 OperationLog
store_db 成功写入后 SHALL 同时在 OperationLog 表记录操作日志。

#### Scenario: 记录交易操作日志
- **WHEN** operation 数据成功写入
- **THEN** SHALL 在 OperationLog 中创建一条记录，action = "create_operation"，detail 包含写入的行数和 portfolioId

#### Scenario: 记录持仓操作日志
- **WHEN** holding 数据成功写入
- **THEN** SHALL 在 OperationLog 中创建一条记录，action = "create_holding"，detail 包含写入的行数和 portfolioId

### Requirement: Portfolio 为用户必填项
store_db 接收的 `confirmedData` 中 `portfolioId` SHALL 为必填字段，由用户在前端选择。

#### Scenario: portfolioId 有效
- **WHEN** confirmedData.portfolioId 对应的 Portfolio 存在
- **THEN** SHALL 正常写入，记录关联到该 Portfolio

#### Scenario: portfolioId 无效
- **WHEN** confirmedData.portfolioId 对应的 Portfolio 不存在
- **THEN** SHALL 拒绝写入，返回 storeResult.success = false
