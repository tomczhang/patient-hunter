## ADDED Requirements

### Requirement: 添加资产按钮触发表单视图
AssetPanel 组件的 `+ 添加资产` 按钮 SHALL 切换 workspace 区域为添加资产表单视图。

#### Scenario: 点击添加按钮进入表单
- **WHEN** 用户在资产面板中点击 `+ 添加资产` 按钮
- **THEN** workspace 区域 SHALL 替换为添加资产表单视图，隐藏摘要卡片、柱状图和资产表格

### Requirement: 资产类型选择器
表单顶部 SHALL 展示 4 种资产类型选项（股票、ETF/基金、加密货币、房产），以 2×2 或 4×1 网格排列，每个选项包含图标和中文标签。

#### Scenario: 默认选中股票类型
- **WHEN** 表单视图首次加载
- **THEN** "股票" 类型 SHALL 处于选中高亮状态

#### Scenario: 切换资产类型
- **WHEN** 用户点击另一个资产类型选项
- **THEN** 该选项 SHALL 变为选中高亮状态，之前选中的选项 SHALL 恢复默认样式

### Requirement: Ticker 搜索框
表单 SHALL 包含一个全宽搜索输入框，带搜索图标和 placeholder 文案。

#### Scenario: 搜索框展示
- **WHEN** 表单视图加载
- **THEN** 搜索输入框 SHALL 展示 placeholder "按名称或代码搜索（如 MSFT）…"，右侧显示搜索图标

#### Scenario: Ticker 预览区域
- **WHEN** 搜索框下方
- **THEN** SHALL 展示一个静态 mock 预览行，包含 ticker chip（如 "MSFT"）、公司名称、交易所名称

### Requirement: 表单字段
表单 SHALL 包含以下 6 个字段，排列为 2 列网格布局：

1. 分类（select 下拉）
2. 币种（select 下拉）
3. 购入日期（date input）
4. 数量（number input）
5. 每股价格（text input）
6. 总成本（text input，禁用状态，自动计算展示）

#### Scenario: 字段布局
- **WHEN** 表单视图加载
- **THEN** 6 个字段 SHALL 以 2 列网格排列，每个字段包含 label（mono 字体、大写）和对应的 input/select 控件

#### Scenario: 总成本字段为只读
- **WHEN** 表单视图加载
- **THEN** 总成本字段 SHALL 为禁用状态（disabled），背景色为灰色，光标显示为 not-allowed

### Requirement: 表单操作按钮
表单底部 SHALL 包含两个操作按钮，以分隔线与表单字段区分。

#### Scenario: 取消操作
- **WHEN** 用户点击"放弃草稿"按钮
- **THEN** SHALL 切换回资产列表视图，表单数据不保留

#### Scenario: 提交操作
- **WHEN** 用户点击"添加到组合"按钮
- **THEN** SHALL 在控制台打印表单数据并切换回资产列表视图

### Requirement: 表单视觉风格
表单视图 SHALL 使用项目现有设计体系（CSS 变量、字体族），居中展示，最大宽度 680px。

#### Scenario: 表单容器样式
- **WHEN** 表单视图展示
- **THEN** 表单 SHALL 在 workspace 区域内水平居中，最大宽度 680px，标题使用 serif 字体，label 使用 mono 字体
