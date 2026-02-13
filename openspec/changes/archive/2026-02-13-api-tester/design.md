## Context

项目现有 6 个 API 端点（health、ai/ocr、stock 系列），每次测试需手动拼 URL / curl，开发效率低。需要内置的轻量级 API 测试工具。

现有技术栈：Next.js 16 (App Router) + Tailwind CSS + TypeScript。

## Goals / Non-Goals

**Goals:**
- 提供配置驱动的 API 注册表，新增 API 只需一行配置
- 提供可视化测试页面，支持所有 HTTP 方法和参数类型
- 展示响应 JSON、状态码、耗时
- 仅 development 模式可用

**Non-Goals:**
- 不生成 OpenAPI/Swagger 文档
- 不支持认证 token 管理（后续扩展）
- 不持久化请求历史到服务端（仅 localStorage）
- 不支持 WebSocket 测试

## Decisions

### 1. 配置驱动 vs 自动发现

**选择**：配置驱动（`lib/api-registry.ts`）

**理由**：Next.js App Router 无 runtime API 列举所有路由；配置式可附带参数描述、示例值、分组等元信息，更灵活可控。

**替代方案**：扫描 `app/api/` 目录自动发现——需要构建时脚本，且无法获取参数信息。

### 2. 页面路由

**选择**：`app/dev/api-tester/page.tsx`

**理由**：`/dev` 前缀语义清晰，与业务路由分离，便于在 middleware 中统一拦截生产环境访问。

### 3. 零第三方依赖

**选择**：纯 `fetch` + React state，不引入 axios、react-query 等

**理由**：此为开发工具，简单即可；减少 bundle 体积和维护负担。

### 4. 参数类型支持

支持三种参数类型：
- `path`：路径参数（如 `{ticker}`），发送前替换 URL 占位符
- `query`：查询参数，追加到 URL `?key=value`
- `body`：请求体，以 JSON 编辑器形式展示

### 5. UI 布局

左侧 sidebar 展示 API 列表（按分组），右侧主区域展示选中 API 的参数表单和响应。单文件组件，不拆分子组件（工具页面，简单即可）。

## Risks / Trade-offs

- [注册表需手动维护] → 每新增 API 需在 `api-registry.ts` 加一行配置，成本极低
- [单文件可能偏长] → 如果超过 500 行则拆分为子组件
- [仅 dev 模式] → 通过 `process.env.NODE_ENV` 检查 + `notFound()` 拦截
