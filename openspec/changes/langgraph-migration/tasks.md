## 1. 依赖安装 & 基础设施

- [ ] 1.1 安装 `@langchain/langgraph` 依赖
- [ ] 1.2 创建 `lib/ai/graph/` 目录结构（state.ts, nodes/, edges.ts, graph.ts）

## 2. Prisma Schema 重命名 & 迁移

- [ ] 2.1 将 Prisma model `Trade` 重命名为 `Operation`（字段不变，表名改为 `operations`）
- [ ] 2.2 将 Prisma model `Position` 重命名为 `Holding`（字段不变，表名改为 `holdings`）
- [ ] 2.3 更新 `Portfolio` model 中的 relation 字段名（`trades → operations`, `positions → holdings`）
- [ ] 2.4 运行 `prisma migrate dev` 生成迁移脚本并验证
- [ ] 2.5 更新项目中所有引用旧 model 名的代码（import、类型引用）

## 3. 类型定义 & 命名统一

- [ ] 3.1 创建 `lib/ai/graph/state.ts`：定义 `TaskType`、`OperationItem`、`HoldingItem`、`ReviewPayload`、`AssetGraphState`
- [ ] 3.2 重命名 `lib/ai/image-pipeline/types.ts` 中的 Zod Schema：`TradeParseSchema → OperationParseSchema`、`PositionParseSchema → HoldingParseSchema`、`TradeItemSchema → OperationItemSchema`、`PositionItemSchema → HoldingItemSchema`
- [ ] 3.3 替换 `ImageType` 为 `TaskType`（"trade_record"→"operation", "position"→"holding"），更新所有引用处
- [ ] 3.4 替换 `ImageParseOutput` 为 `ReviewPayload`，更新所有引用处

## 4. Graph Node 实现

- [ ] 4.1 实现 `nodes/ingest.ts`：判断 inputType，规范化输入
- [ ] 4.2 实现 `nodes/img-classify.ts`：Vision 分类 + unknown fallback 到 text_classify 逻辑
- [ ] 4.3 新建 `CLASSIFY_TEXT_PROMPT`（仅分类，不提取），实现 `nodes/text-classify.ts`：Chat LLM 分类
- [ ] 4.4 实现 `nodes/ext-op.ts`：按 inputType 分派 Vision/Chat 提取 OperationItem[]
- [ ] 4.5 新建 `TEXT_EXTRACT_OPERATION_PROMPT`、`TEXT_EXTRACT_HOLDING_PROMPT`（文本提取专用 prompt）
- [ ] 4.6 实现 `nodes/ext-hold.ts`：按 inputType 分派 Vision/Chat 提取 HoldingItem[]
- [ ] 4.7 实现 `nodes/enrich.ts`：统一遍历 item 调 lookupStock()，AI fallback 使用轻量模型
- [ ] 4.8 实现 `nodes/check-missing.ts`：校验必填字段，tradedAt 默认填充当天日期
- [ ] 4.9 实现 `nodes/present-review.ts`：组装 ReviewPayload + NodeInterrupt
- [ ] 4.10 实现 `nodes/store-db.ts`：Prisma transaction 写入 Operation/Holding + OperationLog，整批回滚

## 5. Graph 组装 & 编译

- [ ] 5.1 实现 `edges.ts`：routeInput（img_classify / text_classify）、routeByTask（ext_op / ext_hold / present_review）
- [ ] 5.2 实现 `graph.ts`：StateGraph 构建、添加 Node 和 Edge、compile with checkpointer
- [ ] 5.3 配置 checkpointer：开发环境 MemorySaver，生产环境 PostgresSaver

## 6. API 端点

- [ ] 6.1 创建 `app/api/ai/asset-graph/invoke/route.ts`：接收输入，生成 threadId，调用 graph.invoke，返回 { threadId, reviewPayload }
- [ ] 6.2 创建 `app/api/ai/asset-graph/resume/route.ts`：接收 threadId + confirmedData，恢复 graph 执行，返回 storeResult；threadId 过期返回 410
- [ ] 6.3 删除 `app/api/ai/parse-text/route.ts`
- [ ] 6.4 删除 `app/api/ai/parse/route.ts`

## 7. 前端改造

- [ ] 7.1 `AddAssetModal.tsx`：增加 threadId state，invoke 后保存 threadId，confirm 时传给 resume
- [ ] 7.2 `ChatInput.tsx`：改调 `/api/ai/asset-graph/invoke`，请求 body 改为 `{ imageData?, textInput? }`，响应解析为 `{ threadId, reviewPayload }`
- [ ] 7.3 `AssetConfirmTable.tsx`：类型重命名（OperationRow / HoldingRow），type 判断从 trade_record/position 改为 operation/holding
- [ ] 7.4 `AssetConfirmTable.tsx`：新增 Portfolio 选择器（下拉，列出用户已有 Portfolio），作为必填项
- [ ] 7.5 `AssetConfirmTable.tsx`：确认按钮改为调 resume API，传入 threadId + confirmedData（含 portfolioId）
- [ ] 7.6 `AssetConfirmTable.tsx`：resume 成功后 `window.location.reload()` 刷新页面
- [ ] 7.7 `AssetConfirmTable.tsx`：resume 返回 410 时显示"已过期"错误提示，回到输入状态
- [ ] 7.8 `AssetConfirmTable.tsx`：unknown 类型展示空表格，支持用户手动添加行

## 8. 清理旧代码

- [ ] 8.1 删除 `lib/ai/image-pipeline/pipeline.ts`（编排逻辑已由 Graph 替代）
- [ ] 8.2 评估 `lib/ai/image-pipeline/` 下其他文件（classifier.ts、parsers/）是否可复用或需迁移到 graph/nodes/
- [ ] 8.3 删除 `lib/ai/tools/stock-lookup.ts` 中的 `stockSearchTool`（不再需要 DynamicStructuredTool）
- [ ] 8.4 清理 `lib/ai/prompts.ts` 中的 `PARSE_TEXT_PROMPT`（替换为新的 CLASSIFY_TEXT_PROMPT 等）
