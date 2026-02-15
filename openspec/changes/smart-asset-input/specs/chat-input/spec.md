## ADDED Requirements

### Requirement: ChatGPT 风格统一输入框
`AddAssetModal` SHALL 展示一个统一的多行文本输入框，替代原有的 Tab 切换（上传截图/填写表单）。输入框支持同时输入文本和上传图片。

#### Scenario: 输入框初始状态
- **WHEN** 用户打开"新增资产"弹窗
- **THEN** SHALL 展示一个多行 textarea，placeholder 为"描述你的交易或持仓信息，也可以上传截图…"，底部左侧有图片上传按钮（📷），右侧有发送按钮（➤）

#### Scenario: 输入框自动扩展高度
- **WHEN** 用户输入多行文本
- **THEN** textarea SHALL 自动扩展高度以适应内容，最大高度不超过 200px，超出后出现滚动条

#### Scenario: 发送按钮禁用状态
- **WHEN** textarea 为空且没有上传图片
- **THEN** 发送按钮 SHALL 处于禁用状态（opacity 降低，不可点击）

### Requirement: 图片上传功能
输入框 SHALL 支持通过按钮点击或拖拽方式上传图片（JPG/PNG/WEBP），上传后在 textarea 下方以缩略图形式预览。

#### Scenario: 点击上传按钮
- **WHEN** 用户点击图片上传按钮（📷）
- **THEN** SHALL 弹出文件选择器，仅允许选择图片文件（image/*）

#### Scenario: 拖拽上传
- **WHEN** 用户将图片文件拖拽到输入框区域
- **THEN** 输入框 SHALL 显示拖拽高亮样式，松开后上传图片

#### Scenario: 图片预览
- **WHEN** 图片上传成功
- **THEN** SHALL 在 textarea 下方展示图片缩略图（64x64），附带删除按钮（×），支持上传多张图片

#### Scenario: 删除已上传图片
- **WHEN** 用户点击图片缩略图上的删除按钮
- **THEN** SHALL 移除该图片，缩略图消失

### Requirement: AI Feature 快捷按钮组
输入框上方 SHALL 展示一组 AI 功能快捷按钮，点击后向 textarea 注入预设的 prompt template 文本。

#### Scenario: 按钮列表
- **WHEN** 弹窗打开
- **THEN** SHALL 展示以下快捷按钮：「录入交易」「解析持仓」「批量导入」，样式为 pill 形状、可点击

#### Scenario: 点击快捷按钮注入文本
- **WHEN** 用户点击「录入交易」按钮
- **THEN** SHALL 向 textarea 注入 "我执行了以下交易：\n" 并自动 focus 到 textarea 末尾

#### Scenario: 点击快捷按钮不覆盖已有内容
- **WHEN** textarea 中已有用户输入的文本，用户点击快捷按钮
- **THEN** SHALL 将 prompt template 追加到已有文本末尾（换行后追加），不覆盖原有内容

### Requirement: 发送触发 AI 解析
用户点击发送按钮后，SHALL 根据输入内容类型调用对应的 API 进行 AI 解析。

#### Scenario: 纯文本发送
- **WHEN** 用户只输入了文本（无图片），点击发送
- **THEN** SHALL 调用 `/api/ai/parse-text` 接口，传入用户文本

#### Scenario: 纯图片发送
- **WHEN** 用户只上传了图片（无文本），点击发送
- **THEN** SHALL 先调用 `/api/upload` 获取 Base64，再调用 `/api/ai/parse` 进行图片解析

#### Scenario: 图片+文本混合发送
- **WHEN** 用户同时输入了文本和上传了图片，点击发送
- **THEN** SHALL 先调用 `/api/upload` 获取 Base64，再调用 `/api/ai/parse` 并附带 `context` 字段传入用户文本

#### Scenario: 解析中 loading 状态
- **WHEN** AI 解析请求发出后
- **THEN** 发送按钮 SHALL 变为 loading 状态（spinner），输入框 SHALL 变为不可编辑，直到解析完成

#### Scenario: 解析失败
- **WHEN** AI 解析接口返回错误
- **THEN** SHALL 在输入框下方展示错误提示（红色文字），输入框恢复可编辑状态，用户可修改后重新发送
