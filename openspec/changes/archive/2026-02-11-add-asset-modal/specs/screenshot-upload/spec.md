## ADDED Requirements

### Requirement: 截图上传区域
弹窗"上传截图" Tab 下 SHALL 展示一个拖拽上传区域，引导用户上传资产截图。

#### Scenario: 空状态展示
- **WHEN** 未上传任何文件
- **THEN** 上传区域 SHALL 展示虚线边框的占位区域，包含上传图标、"点击或拖拽图片到此处"提示文案、支持格式说明（JPG、PNG、WEBP）

#### Scenario: 点击上传
- **WHEN** 用户点击上传区域
- **THEN** SHALL 唤起浏览器文件选择对话框，accept 限制为 image/*

#### Scenario: 拖拽上传
- **WHEN** 用户将图片文件拖拽到上传区域上方
- **THEN** 上传区域 SHALL 显示拖拽悬停高亮样式（边框颜色变化）

#### Scenario: 拖拽释放
- **WHEN** 用户在上传区域释放拖拽的图片文件
- **THEN** SHALL 读取文件并展示预览

### Requirement: 图片预览
上传图片后 SHALL 展示预览和操作区域。

#### Scenario: 预览展示
- **WHEN** 图片上传成功（FileReader 读取完成）
- **THEN** SHALL 隐藏上传占位区域，展示图片预览（max-height 400px，保持宽高比），并在下方显示文件名和文件大小

#### Scenario: 删除已上传图片
- **WHEN** 用户点击预览区域的"删除"按钮
- **THEN** SHALL 清除预览和文件数据，恢复到空状态的上传区域

#### Scenario: 重新上传
- **WHEN** 用户在预览状态下再次选择或拖拽新文件
- **THEN** SHALL 替换之前的预览为新文件

### Requirement: 上传后确认操作
截图上传预览下方 SHALL 提供"确认提交"按钮。

#### Scenario: 确认提交按钮
- **WHEN** 图片已上传且有预览
- **THEN** SHALL 展示"确认提交"按钮（当前阶段点击后 console.log 文件信息并关闭弹窗）

#### Scenario: 无图片时按钮禁用
- **WHEN** 未上传图片
- **THEN** "确认提交"按钮 SHALL 为禁用状态
