## 1. API 注册表

- [x] 1.1 创建 `lib/api-registry.ts`，定义 `ApiEndpoint` 类型和注册表数组
- [x] 1.2 预设所有现有 API 端点（health、ai/ocr、stock 系列共 6 个）

## 2. API 测试页面

- [x] 2.1 创建 `app/dev/api-tester/page.tsx`，添加 production 环境 404 守卫
- [x] 2.2 实现左侧 API 列表侧栏（按 group 分组、方法颜色标签）
- [x] 2.3 实现右侧参数表单（path/query 文本框、body textarea）
- [x] 2.4 实现请求发送逻辑（fetch + 耗时计算 + loading 状态）
- [x] 2.5 实现响应展示区（状态码着色、JSON 格式化、耗时）
- [x] 2.6 实现请求历史功能（localStorage 存储，最多 50 条）

## 3. 验证

- [x] 3.1 运行 build 确认无编译错误
- [x] 3.2 浏览器测试：选择 API、填参、发送、查看响应
