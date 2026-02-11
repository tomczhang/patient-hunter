## MODIFIED Requirements

### Requirement: 添加资产按钮触发表单视图
AssetPanel 组件的"+ 添加资产"按钮 SHALL 弹出模态弹窗，弹窗内"填写表单" Tab 下展示添加资产表单。

#### Scenario: 点击添加按钮进入表单
- **WHEN** 用户在资产面板中点击"+ 添加资产"按钮
- **THEN** SHALL 弹出模态弹窗，用户可切换到"填写表单" Tab 查看表单内容；资产列表保持可见

### Requirement: 表单操作按钮
表单底部 SHALL 包含两个操作按钮，以分隔线与表单字段区分。

#### Scenario: 取消操作
- **WHEN** 用户点击"放弃草稿"按钮
- **THEN** SHALL 关闭弹窗，表单数据不保留

#### Scenario: 提交操作
- **WHEN** 用户点击"添加到组合"按钮
- **THEN** SHALL 在控制台打印表单数据并关闭弹窗
