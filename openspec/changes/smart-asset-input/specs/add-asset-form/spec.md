## MODIFIED Requirements

### Requirement: 添加资产按钮触发表单视图
AssetPanel 组件的 `+ 添加资产` 按钮 SHALL 打开 Modal 弹窗，展示 AI 统一输入界面（替代原有的切换 workspace 区域行为）。

#### Scenario: 点击添加按钮打开弹窗
- **WHEN** 用户在资产面板中点击 `+ 添加资产` 按钮
- **THEN** SHALL 打开 AddAssetModal 弹窗，展示 AI 统一输入界面（FeatureBar + ChatInput）

## REMOVED Requirements

### Requirement: 资产类型选择器
**Reason**: AI 输入模式下不再需要用户手动选择资产类型，由 AI 自动从输入内容推断。
**Migration**: 资产类型由 AI 解析结果自动确定。

### Requirement: Ticker 搜索框
**Reason**: 原有的独立搜索框被 ChatGPT 风格统一输入框替代，用户可在输入框中直接提及股票名称/代码。
**Migration**: 股票识别由 AI 从用户自然语言输入中提取。

### Requirement: 表单字段
**Reason**: 原有的 6 字段手动表单被 AI 解析 + 可编辑确认表格替代。
**Migration**: 字段由 AI 自动填充，用户在确认表格中编辑/补充。

### Requirement: 表单操作按钮
**Reason**: 原有的"放弃草稿"/"添加到组合"按钮被确认表格中的"重新输入"/"确认添加到组合"替代。
**Migration**: 使用确认表格的操作按钮。
