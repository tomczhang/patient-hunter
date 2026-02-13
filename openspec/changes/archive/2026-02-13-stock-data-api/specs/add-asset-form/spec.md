## MODIFIED Requirements

### Requirement: Ticker 搜索框
表单 SHALL 包含一个全宽搜索输入框，支持异步搜索 Massive API 数据。用户输入时 SHALL 执行防抖搜索（300ms），搜索结果从 `/api/stock/search` 接口获取。

#### Scenario: 搜索框展示
- **WHEN** 表单视图加载
- **THEN** 搜索输入框 SHALL 展示 placeholder "按名称或代码搜索（如 AAPL、苹果）…"，右侧显示搜索图标

#### Scenario: 异步搜索触发
- **WHEN** 用户在搜索框输入超过 1 个字符且停止输入 300ms
- **THEN** 系统 SHALL 调用 `GET /api/stock/search?q={input}` 获取搜索结果

#### Scenario: 搜索加载状态
- **WHEN** 搜索请求正在进行中
- **THEN** 下拉列表 SHALL 显示 loading 指示器

#### Scenario: 搜索结果展示
- **WHEN** 搜索返回结果
- **THEN** 下拉列表 SHALL 展示匹配的股票，每项包含 ticker（chip 样式）、中文名（或英文名）、交易所

#### Scenario: 搜索无结果
- **WHEN** 搜索返回空结果
- **THEN** 下拉列表 SHALL 显示"未找到匹配的股票"提示

#### Scenario: 搜索网络错误
- **WHEN** 搜索请求失败（网络错误等）
- **THEN** 下拉列表 SHALL 显示错误提示"搜索失败，请重试"
