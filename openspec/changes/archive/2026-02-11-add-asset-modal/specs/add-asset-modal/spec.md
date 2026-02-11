## ADDED Requirements

### Requirement: 添加资产弹窗触发
AssetPanel 中的"+ 添加资产"按钮 SHALL 弹出模态框，而非替换 workspace 视图。

#### Scenario: 点击按钮弹出弹窗
- **WHEN** 用户在资产面板中点击"+ 添加资产"按钮
- **THEN** 页面 SHALL 展示一个居中的模态弹窗，背景显示半透明遮罩层，资产列表保持可见但不可交互

#### Scenario: 弹窗关闭 — 点击遮罩
- **WHEN** 用户点击弹窗外的遮罩层区域
- **THEN** 弹窗 SHALL 关闭，回到资产面板列表视图

#### Scenario: 弹窗关闭 — ESC 键
- **WHEN** 弹窗处于打开状态，用户按下 ESC 键
- **THEN** 弹窗 SHALL 关闭

#### Scenario: 弹窗关闭 — 关闭按钮
- **WHEN** 用户点击弹窗右上角的关闭按钮（×）
- **THEN** 弹窗 SHALL 关闭

### Requirement: 弹窗内 Tab 切换
弹窗内 SHALL 提供两个 Tab："上传截图"和"填写表单"，用户可在两种录入模式间切换。

#### Scenario: 默认展示上传截图 Tab
- **WHEN** 弹窗打开
- **THEN** "上传截图" Tab SHALL 处于激活状态，展示截图上传区域

#### Scenario: 切换到填写表单 Tab
- **WHEN** 用户点击"填写表单" Tab
- **THEN** "填写表单" Tab SHALL 变为激活状态，展示表单字段（资产类型选择器、搜索、表单字段等）

#### Scenario: Tab 切换保持状态
- **WHEN** 用户在"上传截图" Tab 中已上传一张图片，然后切换到"填写表单" Tab 再切回
- **THEN** 已上传的图片预览 SHALL 仍然保留

### Requirement: 弹窗视觉规格
弹窗 SHALL 符合项目设计体系，使用 CSS 变量和现有字体族。

#### Scenario: 弹窗容器样式
- **WHEN** 弹窗展示
- **THEN** 弹窗 SHALL 最大宽度 720px，圆角 20px，背景白色，有阴影，垂直方向可滚动（内容超出时）

#### Scenario: 遮罩层样式
- **WHEN** 弹窗展示
- **THEN** 遮罩层 SHALL 为半透明黑色（rgba 0,0,0,0.4）且覆盖整个视口
