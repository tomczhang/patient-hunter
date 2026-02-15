## ADDED Requirements

### Requirement: invoke 端点
系统 SHALL 提供 `POST /api/ai/asset-graph/invoke` 端点，接收用户输入并执行 Graph 到 interrupt 点。

#### Scenario: 图片输入
- **WHEN** 请求 body 为 `{ "imageData": "data:image/png;base64,..." }`
- **THEN** SHALL 执行 Graph 到 present_review 节点 interrupt，返回 `{ threadId: string, reviewPayload: ReviewPayload }`

#### Scenario: 文本输入
- **WHEN** 请求 body 为 `{ "textInput": "买了100股苹果150美元" }`
- **THEN** SHALL 执行 Graph 到 present_review 节点 interrupt，返回 `{ threadId: string, reviewPayload: ReviewPayload }`

#### Scenario: 图片+文字混合输入
- **WHEN** 请求 body 为 `{ "imageData": "...", "textInput": "这是港股交易" }`
- **THEN** SHALL 走图片路径，textInput 作为辅助 context

#### Scenario: 缺少输入
- **WHEN** 请求 body 中 imageData 和 textInput 均为空
- **THEN** SHALL 返回 400 状态码和 `{ "error": "缺少输入参数" }`

### Requirement: resume 端点
系统 SHALL 提供 `POST /api/ai/asset-graph/resume` 端点，用于用户确认后恢复 Graph 执行。

#### Scenario: 正常 resume
- **WHEN** 请求 body 为 `{ "threadId": "xxx", "confirmedData": { "rows": [...], "riskCategory": "aggressive", "portfolioId": 1 } }`
- **THEN** SHALL 恢复 Graph 执行 store_db 节点，返回 `{ storeResult: { success: true, ids: [1, 2] } }`

#### Scenario: threadId 过期
- **WHEN** 请求 body 中 `threadId` 对应的 thread 已过期或不存在
- **THEN** SHALL 返回 410 状态码和 `{ "error": "上次解析结果已过期，请重新输入" }`

#### Scenario: store_db 写入失败
- **WHEN** Prisma 写入过程中发生错误
- **THEN** SHALL 返回 500 状态码和 `{ "error": "数据写入失败: <具体原因>" }`

### Requirement: threadId 生成与管理
每次 invoke 调用 SHALL 生成唯一的 `threadId`（UUID），作为 LangGraph checkpointer 的 thread 标识。

#### Scenario: threadId 唯一性
- **WHEN** 两次独立的 invoke 调用
- **THEN** SHALL 生成不同的 threadId

#### Scenario: resume 使用同一 threadId
- **WHEN** 用户使用 invoke 返回的 threadId 调用 resume
- **THEN** SHALL 恢复同一 thread 的 Graph 状态继续执行
