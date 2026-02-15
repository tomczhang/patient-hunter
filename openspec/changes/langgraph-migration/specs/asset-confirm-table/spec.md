## MODIFIED Requirements

### Requirement: 可编辑确认表格
AI 解析成功后，SHALL 在输入框下方展示可编辑的资产确认表格，用户可修改任何字段后确认提交。

#### Scenario: 交易记录表格展示
- **WHEN** reviewPayload.type 为 "operation"
- **THEN** SHALL 展示包含以下列的可编辑表格：操作（买入/卖出）、股票代码、股票名称、数量、价格、币种、日期

#### Scenario: 持仓信息表格展示
- **WHEN** reviewPayload.type 为 "holding"
- **THEN** SHALL 展示包含以下列的可编辑表格：股票代码、股票名称、持仓数量、成本价、币种

#### Scenario: 未识别类型展示
- **WHEN** reviewPayload.type 为 "unknown"
- **THEN** SHALL 展示空表格，提示"无法识别为交易或持仓信息"，允许用户手动添加行

### Requirement: 缺失字段高亮提示
AI 未能推断的字段 SHALL 以高亮样式提示用户补充。

#### Scenario: 缺失字段标记
- **WHEN** reviewPayload.missingFields 中包含某个字段路径
- **THEN** 该单元格 SHALL 显示浅红色背景和 placeholder 提示文字（如"请补充"）

#### Scenario: UNKNOWN ticker 警告
- **WHEN** reviewPayload.warnings 中包含 UNKNOWN ticker 信息
- **THEN** SHALL 在表格上方显示警告提示

#### Scenario: 全部必填字段填写后
- **WHEN** 用户补充了所有缺失的必填字段（股票代码、数量、价格/成本价）且选择了 Portfolio
- **THEN** 确认按钮 SHALL 变为可点击状态

### Requirement: Portfolio 选择器
表格下方 SHALL 展示 Portfolio 选择器，作为必填项。

#### Scenario: Portfolio 选择展示
- **WHEN** 确认表格展示
- **THEN** 表格下方 SHALL 展示 Portfolio 选择器（下拉列表显示已有 Portfolio）

#### Scenario: Portfolio 未选择时禁止提交
- **WHEN** 用户未选择任何 Portfolio
- **THEN** 确认按钮 SHALL 为禁用状态

### Requirement: 确认操作调用 resume
表格底部 SHALL 包含操作按钮，确认时调用 resume API。

#### Scenario: 确认添加
- **WHEN** 用户点击"确认添加到组合"按钮
- **THEN** SHALL 调用 `POST /api/ai/asset-graph/resume`，传入 threadId 和 confirmedData（含编辑后的 rows、riskCategory、portfolioId）

#### Scenario: resume 成功后刷新
- **WHEN** resume API 返回 `storeResult.success = true`
- **THEN** SHALL 关闭弹窗并刷新页面（`window.location.reload()`）

#### Scenario: resume 失败（过期）
- **WHEN** resume API 返回 410 状态码
- **THEN** SHALL 显示错误提示"上次解析结果已过期，请重新输入"，回到输入状态

#### Scenario: 重新输入
- **WHEN** 用户点击"重新输入"按钮
- **THEN** SHALL 清除解析结果和 threadId，回到输入框状态

#### Scenario: 多行数据逐行删除
- **WHEN** 解析结果包含多行数据，用户点击某行的删除按钮
- **THEN** SHALL 移除该行，剩余行保留

## RENAMED Requirements

### Requirement: 类型命名变更
- FROM: `trade_record` / `position` / `ImageType` / `TradeRow` / `PositionRow`
- TO: `operation` / `holding` / `TaskType` / `OperationRow` / `HoldingRow`
