## ADDED Requirements

### Requirement: API 注册表配置结构
系统 SHALL 提供 `lib/api-registry.ts` 文件，以数组形式声明所有可测试的 API 端点。每个端点配置 MUST 包含 `name`（中文名）、`method`（HTTP 方法）、`path`（URL 路径，支持 `{param}` 占位符）、`group`（分组名）、`params`（参数列表）。

#### Scenario: 注册一个 GET API
- **WHEN** 在注册表中添加 `{ name: "健康检查", method: "GET", path: "/api/health", group: "系统", params: [] }`
- **THEN** 该端点可在 API 测试页面列表中出现

#### Scenario: 注册带路径参数的 API
- **WHEN** 在注册表中添加 `{ path: "/api/stock/{ticker}", params: [{ key: "ticker", in: "path", required: true }] }`
- **THEN** 测试页面 SHALL 在 URL 中替换 `{ticker}` 为用户输入的值

### Requirement: 参数定义支持三种类型
每个参数 MUST 包含 `key`（名称）、`in`（类型: `path` | `query` | `body`）、`required`（是否必填）。可选字段：`placeholder`（输入提示）、`default`（默认值）。

#### Scenario: query 参数定义
- **WHEN** 参数定义为 `{ key: "q", in: "query", required: true, placeholder: "apple" }`
- **THEN** 该参数 SHALL 以 `?q=value` 形式追加到请求 URL

#### Scenario: body 参数定义
- **WHEN** 参数定义为 `{ key: "imageBase64", in: "body", required: true }`
- **THEN** 该参数 SHALL 作为 JSON 请求体的字段发送

### Requirement: 预设所有现有 API 端点
注册表 MUST 包含项目当前所有 API：`/api/health`、`/api/ai/ocr`、`/api/stock/search`、`/api/stock/{ticker}`、`/api/stock/{ticker}/bars`、`/api/stock/{ticker}/high`。

#### Scenario: 全量预设
- **WHEN** 开发者首次打开 API 测试页面
- **THEN** 侧栏 SHALL 展示 6 个 API 端点
