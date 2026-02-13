## Why

项目 API 数量不断增长（health、ai/ocr、stock 系列），每次测试需要手动拼 curl 或使用 Postman 等外部工具，效率低且上下文割裂。需要一个内置的、配置驱动的 API 测试页面，让开发者在浏览器内即可快速测试所有端点。

## What Changes

- 新增 API 注册表 `lib/api-registry.ts`，以声明式配置描述所有 API 端点的元信息（method、path、params、examples）
- 新增开发者页面 `/dev/api-tester`，提供 API 列表、参数编辑、请求发送、响应展示功能
- 仅 development 模式可用，生产环境不暴露
- 零第三方依赖，纯 Next.js + React 实现

## Capabilities

### New Capabilities
- `api-registry`: API 端点的声明式注册表配置，支持 path/query/body 参数、预设示例
- `api-tester-page`: 开发者 API 测试页面 UI，包含 API 列表侧栏、参数表单、请求发送与响应展示

### Modified Capabilities

（无）

## Impact

- 新增文件：`lib/api-registry.ts`、`app/dev/api-tester/page.tsx`
- 不影响现有 API 逻辑，仅为开发辅助工具
- 不引入新的第三方依赖
