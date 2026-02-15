## ADDED Requirements

### Requirement: 可编辑确认表格
AI 解析成功后，SHALL 在输入框下方展示可编辑的资产确认表格，用户可修改任何字段后确认提交。

#### Scenario: 交易记录表格展示
- **WHEN** AI 解析结果 type 为 "trade_record"
- **THEN** SHALL 展示包含以下列的可编辑表格：操作（买入/卖出）、股票代码、股票名称、数量、价格、币种、日期

#### Scenario: 持仓信息表格展示
- **WHEN** AI 解析结果 type 为 "position"
- **THEN** SHALL 展示包含以下列的可编辑表格：股票代码、股票名称、持仓数量、成本价、当前价格、币种

#### Scenario: 未识别类型展示
- **WHEN** AI 解析结果 type 为 "unknown"
- **THEN** SHALL 展示 rawText 原始文本和提示"无法识别为交易或持仓信息，请修改输入后重试"

### Requirement: 表格字段可编辑
确认表格中的每个数据字段 SHALL 可由用户直接编辑修改。

#### Scenario: 编辑股票代码
- **WHEN** 用户点击表格中的股票代码单元格
- **THEN** SHALL 变为 text input 可编辑状态，用户可修改值

#### Scenario: 编辑操作类型
- **WHEN** 用户点击表格中的"操作"单元格
- **THEN** SHALL 展示 select 下拉（买入/卖出），用户可切换

#### Scenario: 编辑币种
- **WHEN** 用户点击表格中的"币种"单元格
- **THEN** SHALL 展示 select 下拉（USD/HKD/CNY），用户可切换

### Requirement: 缺失字段高亮提示
AI 未能推断的字段 SHALL 以高亮样式提示用户补充。

#### Scenario: 缺失字段标记
- **WHEN** 解析结果中某个字段为空或 undefined
- **THEN** 该单元格 SHALL 显示浅红色背景和 placeholder 提示文字（如"请补充"）

#### Scenario: 全部必填字段填写后
- **WHEN** 用户补充了所有缺失的必填字段（股票代码、数量、价格）
- **THEN** 确认按钮 SHALL 变为可点击状态

### Requirement: 补充风险分类字段
表格下方 SHALL 展示风险分类选择器（进取仓/稳健仓/防守仓），因为此字段 AI 通常无法推断。

#### Scenario: 风险分类展示
- **WHEN** 确认表格展示
- **THEN** 表格下方 SHALL 展示风险分类 select 控件，默认值为"进取仓"

### Requirement: 确认操作
表格底部 SHALL 包含操作按钮。

#### Scenario: 确认添加
- **WHEN** 用户点击"确认添加到组合"按钮
- **THEN** SHALL 在控制台打印最终确认的结构化数据，并关闭弹窗

#### Scenario: 重新输入
- **WHEN** 用户点击"重新输入"按钮
- **THEN** SHALL 清除解析结果，回到输入框状态，保留之前的输入文本和图片

#### Scenario: 多行数据逐行删除
- **WHEN** 解析结果包含多行数据（如多笔交易），用户点击某行的删除按钮
- **THEN** SHALL 移除该行，剩余行保留
