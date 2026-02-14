## 1. 类型定义

- [x] 1.1 在 `lib/stock/types.ts` 新增 `IndexDrop` 接口

## 2. 业务逻辑

- [x] 2.1 在 `lib/stock/service.ts` 新增 `getIndexDrop()` 方法（Promise.all 并发 VOO+QQQM，加权计算）

## 3. API 路由

- [x] 3.1 创建 `app/api/stock/index-drop/route.ts`

## 4. API 注册

- [x] 4.1 在 `lib/api-registry.ts` 注册宽指跌幅端点

## 5. 验证

- [x] 5.1 运行 build 确认无编译错误
- [x] 5.2 通过 API Tester 验证接口返回正确数据
