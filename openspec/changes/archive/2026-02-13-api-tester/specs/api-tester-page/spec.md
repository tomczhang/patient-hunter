## ADDED Requirements

### Requirement: 仅 development 模式可访问
页面 SHALL 在 `process.env.NODE_ENV === "production"` 时返回 404，不暴露任何内容。

#### Scenario: 生产环境访问
- **WHEN** 用户在生产环境访问 `/dev/api-tester`
- **THEN** 系统 SHALL 返回 404 页面

#### Scenario: 开发环境访问
- **WHEN** 用户在开发环境访问 `/dev/api-tester`
- **THEN** 系统 SHALL 展示 API 测试页面

### Requirement: API 列表侧栏
页面左侧 SHALL 展示按 `group` 分组的 API 列表。每个条目展示 HTTP 方法标签（带颜色区分）和 API 名称。点击条目 SHALL 选中该 API 并在右侧展示其详情。

#### Scenario: 分组展示
- **WHEN** 注册表包含 group 为 "系统" 和 "股票" 的 API
- **THEN** 侧栏 SHALL 按分组展示，每组有标题

#### Scenario: 方法颜色区分
- **WHEN** 侧栏展示 GET 和 POST 方法的 API
- **THEN** GET SHALL 显示绿色标签，POST SHALL 显示蓝色标签

### Requirement: 参数表单
选中 API 后，右侧 SHALL 展示该 API 的所有参数输入框。path 参数和 query 参数以文本输入框形式展示，body 参数以 textarea（JSON 编辑）形式展示。必填参数 SHALL 标记星号。

#### Scenario: 路径参数输入
- **WHEN** 用户选中 `/api/stock/{ticker}` 端点
- **THEN** 表单 SHALL 展示 `ticker` 文本输入框，标记为必填

#### Scenario: Body 参数输入
- **WHEN** 用户选中 POST `/api/ai/ocr` 端点
- **THEN** 表单 SHALL 展示 JSON 编辑 textarea

### Requirement: 发送请求并展示响应
点击"发送请求"按钮后，系统 SHALL 使用 `fetch` 发起请求，展示响应状态码、耗时（ms）、格式化的 JSON 响应体。请求期间 SHALL 展示 loading 状态。

#### Scenario: 成功请求
- **WHEN** 用户填入参数并点击发送
- **THEN** 页面 SHALL 展示 HTTP 状态码（如 200）、耗时、JSON 响应

#### Scenario: 请求失败
- **WHEN** 请求返回 4xx/5xx 状态码
- **THEN** 页面 SHALL 展示错误状态码和响应内容，使用红色标记

#### Scenario: 加载中状态
- **WHEN** 请求正在进行中
- **THEN** 发送按钮 SHALL 展示 loading 状态并禁用重复点击

### Requirement: 请求历史（localStorage）
系统 SHALL 将每次请求的参数和响应存入 `localStorage`，下次打开页面时可查看历史记录。最多保留 50 条。

#### Scenario: 保存历史
- **WHEN** 用户成功发送一次请求
- **THEN** 该请求的 URL、参数、状态码、响应 SHALL 存入 localStorage

#### Scenario: 查看历史
- **WHEN** 用户再次打开 API 测试页面
- **THEN** 可查看之前的请求历史记录
