## Why

当前"新增资产"的后端 AI 逻辑使用 LangChain 实现，存在以下问题：
- **图片和文本两条路径完全割裂**：`/api/ai/parse`（图片 pipeline）和 `/api/ai/parse-text`（手写 Agent while 循环）各自独立，数据流和编排方式不统一
- **节点职责不清**：文本路径在单个 API route 中混合了意图分类、结构化提取、tool calling 循环、JSON 解析等多步逻辑
- **enrichment 逻辑重复**：图片路径用 `enrichment.ts` 后处理，文本路径用 Agent tool calling，底层都是 `searchStocks() → aiSearchFallback()`
- **无全生命周期管理**：解析 → 用户确认 → 入库 分散在不同模块，缺少统一的状态流转

希望使用 LangGraph 重构为一个统一的有向图，使每个节点职责单一、流程清晰、支持 human-in-the-loop（interrupt/resume）。

## What Changes

- **新增** LangGraph 有向图 `AssetGraph`，统一图片/文本两条解析路径为 9 个 Node 的线性图
- **新增** `@langchain/langgraph` 依赖
- **新增** Graph State 类型定义（`AssetGraphState`）
- **新增** human-in-the-loop：Graph 在 `present_review` 节点 interrupt，用户确认后 resume 走 `store_db`
- **移除** `/api/ai/parse-text` 中的手写 Agent while 循环，改为 Graph 中的 `text_extract` 节点（单次 LLM，无 tool calling）
- **重构** `enrichment.ts` 为 Graph 中的 `enrich` 节点，图片和文本路径统一使用
- **重构** `/api/ai/parse` 和 `/api/ai/parse-text` 合并为单一 API 入口，调用 Graph
- **新增** `store_db` 节点，实现用户确认后的 operation/holding 数据入库（Prisma）
- **统一** task 类型命名：`trade_record → operation`，`position → holding`

## Capabilities

### New Capabilities
- `asset-graph`: LangGraph 有向图定义（State、9 个 Node、条件 Edge、interrupt 配置）
- `asset-graph-api`: 统一的 API 入口，支持 invoke（新输入）和 resume（用户确认）两种调用模式
- `store-db`: 用户确认后将 operation/holding 数据写入数据库

### Modified Capabilities
- `text-parse-api`: 从 Agent tool calling 模式改为单次 LLM 提取，移除 stock_search tool 依赖
- `asset-confirm-table`: 类型命名从 `trade_record/position` 改为 `operation/holding`

## Impact

- **后端核心**：新增 `lib/ai/graph/` 目录（state.ts、nodes/、edges/、graph.ts）
- **API**：`/api/ai/parse` 和 `/api/ai/parse-text` 合并为 `/api/ai/asset-graph`（invoke + resume）
- **依赖**：新增 `@langchain/langgraph`
- **数据库**：`store_db` 节点写入 Prisma（需确认 schema 中 operation/holding 表结构）
- **前端**：`ChatInput.tsx` 改调新 API；`AssetConfirmTable.tsx` 类型命名更新；`AddAssetModal.tsx` 增加 thread_id 管理（interrupt/resume）
- **可删除**：`lib/ai/image-pipeline/pipeline.ts`（编排逻辑由 Graph 替代）；`/api/ai/parse-text/route.ts`（合并到新 API）
