## Context

当前"新增资产"的 AI 解析链路使用 LangChain 构建，分为两条独立路径：

| 路径 | 入口 API | 实现方式 | 涉及文件 |
|---|---|---|---|
| 图片 | `/api/ai/parse` | pipeline.ts → classify → parse → enrich | `lib/ai/image-pipeline/*`, `lib/ai/enrichment.ts` |
| 文本 | `/api/ai/parse-text` | 手写 while 循环 Agent（LLM + bindTools） | `app/api/ai/parse-text/route.ts`, `lib/ai/tools/stock-lookup.ts` |

两条路径的 enrichment 逻辑（查找正确 ticker + 自动填充币种）底层一致（`searchStocks → aiSearchFallback`），但实现方式不同（后处理遍历 vs Agent tool calling）。

前端状态由 `AddAssetModal`（phase: input → result）管理，解析和入库是断开的（确认后仅 `console.log`）。

已有 Prisma Schema 中 `Trade`（交易记录）和 `Position`（持仓）表结构完备，可直接写入。

## Goals / Non-Goals

**Goals:**
- 使用 LangGraph 构建统一的有向图 `AssetGraph`，合并图片和文本两条解析路径
- 每个 Node 职责单一，prompt 仅存在于对应节点内
- 支持 human-in-the-loop（interrupt/resume）：Graph 在用户确认环节暂停，确认后恢复执行入库
- 统一 enrichment 为单一的程序化后处理节点
- 实现 `store_db` 节点，完成 operation/holding 数据写入 Prisma

**Non-Goals:**
- 多轮对话（仍然是单轮：输入 → 解析 → 确认 → 入库）
- LangGraph Studio / LangSmith 集成（后续考虑）
- 前端 UI 重写（仅改 API 调用方式和 thread_id 管理）

## Decisions

### 1. Graph 整体架构：10 Node 线性图 + 1 interrupt

```
┌──────────────────────────────────────────────────────────────┐
│                        AssetGraph                             │
│                                                               │
│  ┌─────────┐                                                  │
│  │ ingest  │  判断 inputType, 规范化                          │
│  └────┬────┘                                                  │
│       │                                                       │
│       ▼                                                       │
│  ┌──────────────┐                                             │
│  │ route_input  │  conditional edge                           │
│  └──┬───────┬───┘                                             │
│     │image  │text                                             │
│     ▼       ▼                                                 │
│  ┌──────────┐ ┌───────────────┐                               │
│  │img_class │ │ text_classify │  Chat LLM 分类               │
│  │ify      │ │               │                               │
│  │(vision)  │ └───────┬───────┘                               │
│  └────┬─────┘         │                                       │
│       │               │                                       │
│       │  ★fallback★   │                                       │
│       │  unknown 且有  │                                       │
│       │  textInput →──┘                                       │
│       │                                                       │
│       ▼               ▼                                       │
│  ┌────────────────────────────┐                               │
│  │       route_by_task        │  op / hold / unknown          │
│  └──┬───────────┬──────────┬──┘                               │
│     │op         │hold      │unk                               │
│     ▼           ▼          ▼                                  │
│  ┌──────┐  ┌──────┐   present_review (无法识别)               │
│  │ ext  │  │ ext  │                                           │
│  │ _op  │  │_hold │   内部按 inputType 选 vision/chat         │
│  └──┬───┘  └──┬───┘                                           │
│     │         │                                               │
│     ▼         ▼                                               │
│  ┌──────────────────────┐                                     │
│  │       enrich         │  遍历 item → DB + AI fallback       │
│  │                      │  AI fallback 使用轻量模型            │
│  └──────────┬───────────┘                                     │
│             │                                                 │
│             ▼                                                 │
│  ┌──────────────────────┐                                     │
│  │    check_missing     │  校验必填字段                       │
│  └──────────┬───────────┘                                     │
│             │                                                 │
│             ▼                                                 │
│  ┌──────────────────────┐                                     │
│  │   present_review     │  组装 reviewPayload                 │
│  │    ★ interrupt ★     │  → 返回前端展示 table               │
│  └──────────┬───────────┘                                     │
│             │  resume (用户确认/编辑后的数据)                  │
│             ▼                                                 │
│  ┌──────────────────────┐                                     │
│  │      store_db        │  Prisma 写入 Operation / Holding    │
│  └──────────┬───────────┘                                     │
│             ▼                                                 │
│            END                                                │
└───────────────────────────────────────────────────────────────┘
```

**关键设计变化（基于 clarifications）**：

1. **文本路径拆分 classify + extract**：`text_classify`（Chat LLM 判断 operation/holding/unknown）与 `text_extract`（根据 task 选 prompt 提取）分为两步，与图片路径对称。
2. **图片+文字 fallback**：`img_classify` 结果为 unknown 且 `textInput` 存在时，回退到 `text_classify` 重试，并在 warnings 中记录"图片无效"。
3. **extract 节点统一**：`ext_op` 和 `ext_hold` 内部根据 `inputType` 选择 Vision 或 Chat 模型+对应 prompt，不再区分 `parse_oper` vs `text_extract_oper`。
4. **enrich AI fallback 使用轻量模型**：与 text_classify/text_extract 使用的 chat 模型分开。
5. **unknown → 空 rows**：unknown 到 present_review 时 rows 为空数组，前端允许用户手动添加行。

**为什么不用 Agent 循环？** 所有 LLM 节点均为单次调用，ticker/currency 补全统一由 enrich 节点程序化处理。整个 Graph 无循环、纯线性，降低复杂度。

**为什么选 interrupt/resume 而不是两次独立调用？** interrupt 让 Graph 天然管理全生命周期状态（解析 → 等待确认 → 入库），前端只需持有 `thread_id`，不用自己维护中间数据。这是 LangGraph 的核心价值。

### 2. State 定义

```typescript
import { Annotation } from "@langchain/langgraph";
import type { BaseMessage } from "@langchain/core/messages";

type TaskType = "operation" | "holding" | "unknown";

interface OperationItem {
  ticker: string;
  name: string;
  action: "buy" | "sell";
  quantity: number;
  price: number;
  currency: string;
  tradedAt: string | null;
  memo?: string;
}

interface HoldingItem {
  ticker: string;
  name: string;
  quantity: number;
  costPrice: number;
  currency: string;
}

interface ReviewPayload {
  type: TaskType;
  rows: OperationItem[] | HoldingItem[];
  missingFields: string[];   // 如 ["rows[0].ticker", "rows[1].price"]
  warnings: string[];        // 如 ["UNKNOWN ticker: 泡泡玛特"]
}

const AssetGraphState = Annotation.Root({
  // ─── 输入 ───
  inputType: Annotation<"image" | "text">,
  imageData: Annotation<string | undefined>,
  textInput: Annotation<string | undefined>,

  // ─── 分类 & 提取 ───
  task: Annotation<TaskType>,
  extractedData: Annotation<OperationItem[] | HoldingItem[] | null>,

  // ─── UI 输出 ───
  reviewPayload: Annotation<ReviewPayload | null>,

  // ─── 用户确认后的数据（resume 时写入） ───
  confirmedData: Annotation<{
    rows: OperationItem[] | HoldingItem[];
    riskCategory: string;
    portfolioId: number;
  } | null>,

  // ─── 入库结果 ───
  storeResult: Annotation<{ success: boolean; ids: number[] } | null>,
});
```

**设计要点**：
- 去掉了 `messages`——不再需要 Agent tool calling 的消息历史
- 去掉了 `sessionId`——由 LangGraph 的 `thread_id` config 管理
- 去掉了 `phase`——由 Graph 执行到哪个 Node 隐含表达
- 新增 `confirmedData`——resume 时由前端传入，包含用户可能编辑过的行数据 + 风险分类 + portfolioId
- 新增 `storeResult`——入库结果

### 3. 各 Node 详细设计

#### 3.1 ingest — 输入规范化

```
输入：前端原始请求 { imageData?, textInput? }
输出：填充 inputType
逻辑：有 imageData → inputType = "image"，否则 → "text"
LLM：无
```

#### 3.2 img_classify — 图片分类（图片路径）

```
输入：imageData, textInput(可选辅助)
输出：task ("operation" | "holding" | "unknown")
逻辑：复用现有 classifyImage()，返回值映射：
       trade_record → operation, position → holding
       ★ 若结果为 unknown 且 textInput 存在：
         回退到 text_classify 逻辑（用文本重新分类）
         reviewPayload.warnings 追加 "图片无效，已按文字内容处理"
LLM：Vision 模型 + withStructuredOutput(ClassifySchema)
Prompt：CLASSIFY_IMAGE_PROMPT（已有）
```

#### 3.3 text_classify — 文本分类（文本路径）

```
输入：textInput
输出：task ("operation" | "holding" | "unknown")
逻辑：Chat LLM 判断用户文本描述的是交易操作还是持仓信息
       仅输出 type + confidence + reason，不做数据提取
LLM：Chat 模型
Prompt：新建 CLASSIFY_TEXT_PROMPT（简洁版，仅分类）
```

#### 3.4 ext_op — 交易记录提取（operation）

```
输入：imageData 或 textInput（根据 inputType）, task
输出：extractedData (OperationItem[])
逻辑：根据 inputType 分派：
       image → Vision + withStructuredOutput(OperationParseSchema)
       text  → Chat + withStructuredOutput(OperationParseSchema)
       name/ticker 允许近似值（enrich 会修正），不输出 currency
LLM：image 用 Vision 模型，text 用 Chat 模型
Prompt：image → PARSE_OPERATION_PROMPT, text → TEXT_EXTRACT_OPERATION_PROMPT
```

#### 3.5 ext_hold — 持仓提取（holding）

```
输入：imageData 或 textInput（根据 inputType）, task
输出：extractedData (HoldingItem[])
逻辑：根据 inputType 分派：
       image → Vision + withStructuredOutput(HoldingParseSchema)
       text  → Chat + withStructuredOutput(HoldingParseSchema)
       name/ticker 允许近似值（enrich 会修正），不输出 currency
LLM：image 用 Vision 模型，text 用 Chat 模型
Prompt：image → PARSE_HOLDING_PROMPT, text → TEXT_EXTRACT_HOLDING_PROMPT
```

#### 3.6 enrich — ticker/currency 补全（统一）

```
输入：extractedData
输出：extractedData（ticker 和 currency 已修正）
逻辑：遍历每个 item，对 name 或 ticker 调 lookupStock()：
       1. searchStocks()（本地 DB + Massive API）
       2. aiSearchFallback()（轻量 LLM 模型）
       3. 都找不到 → ticker = "UNKNOWN"
       根据 ticker 后缀自动推断 currency（.HK→HKD, .SS/.SZ→CNY, 其他→USD）
LLM：仅 fallback 时使用轻量模型（如 gpt-4o-mini）
复用：lib/ai/enrichment.ts 中的 lookupStock() 核心逻辑
```

#### 3.7 check_missing — 必填字段校验

```
输入：extractedData, task
输出：reviewPayload.missingFields, reviewPayload.warnings
逻辑：
  operation 必填：ticker, quantity, price
  holding 必填：ticker, quantity, costPrice
  检查每行每个必填字段，空值或 "UNKNOWN" 记入 missingFields
  ticker 为 "UNKNOWN" 的记入 warnings
LLM：无
```

#### 3.8 present_review — 组装 reviewPayload + interrupt

```
输入：task, extractedData, missingFields, warnings
输出：reviewPayload（完整的 ReviewPayload 对象）
逻辑：组装后 interrupt，Graph 暂停
       前端收到 reviewPayload 后渲染 AssetConfirmTable
       用户编辑/确认后 resume，前端传入 confirmedData
LLM：无
```

**interrupt 机制**：使用 LangGraph 的 `NodeInterrupt`。Graph 执行到此节点后抛出 interrupt，客户端通过 `thread_id` 标识会话，resume 时传入 `confirmedData`。

#### 3.9 store_db — 入库

```
输入：confirmedData { rows, riskCategory, portfolioId }
输出：storeResult { success, ids }
逻辑：
  根据 task 类型：
  - operation → Prisma Operation.createMany()
  - holding → Prisma Holding.createMany()
  同时写入 OperationLog
  tradedAt 为空时默认填充当天日期
  使用 Prisma transaction，任一行失败则整批回滚
LLM：无
```

### 4. Conditional Edges

```typescript
// Edge 1: ingest 之后按 inputType 路由
function routeInput(state): "img_classify" | "text_classify" {
  return state.inputType === "image" ? "img_classify" : "text_classify";
}

// Edge 2: classify 之后按 task 路由（img_classify 和 text_classify 共用）
function routeByTask(state): "ext_op" | "ext_hold" | "present_review" {
  if (state.task === "operation") return "ext_op";
  if (state.task === "holding") return "ext_hold";
  return "present_review"; // unknown → 直接跳到 review 告知无法识别
}
```

### 5. Checkpointer 选择

| 环境 | Checkpointer | 说明 |
|---|---|---|
| 开发 | `MemorySaver` | 内存存储，重启丢失，开发够用 |
| 生产 | `PostgresSaver` | 复用现有 PG 数据库，持久化 thread 状态 |

### 6. API 设计

合并为单一端点 `/api/ai/asset-graph`：

```
POST /api/ai/asset-graph/invoke
Body: { imageData?, textInput? }
Response: { threadId, reviewPayload }
说明: 首次调用，Graph 执行到 interrupt 返回

POST /api/ai/asset-graph/resume
Body: { threadId, confirmedData: { rows, riskCategory, portfolioId } }
Response: { storeResult: { success, ids } }
说明: 用户确认后 resume，Graph 执行 store_db 后返回
```

### 7. 文件结构

```
lib/ai/graph/
├── state.ts              # AssetGraphState 类型定义 + OperationItem/HoldingItem
├── nodes/
│   ├── ingest.ts         # 输入规范化
│   ├── img-classify.ts   # 图片分类（Vision）+ unknown fallback 到 text
│   ├── text-classify.ts  # 文本分类（Chat LLM）
│   ├── ext-op.ts         # 交易记录提取（按 inputType 选 vision/chat）
│   ├── ext-hold.ts       # 持仓提取（按 inputType 选 vision/chat）
│   ├── enrich.ts         # ticker/currency 补全（轻量 LLM fallback）
│   ├── check-missing.ts  # 必填字段校验
│   ├── present-review.ts # 组装 reviewPayload + interrupt
│   └── store-db.ts       # Prisma 写入（transaction 整批回滚）
├── edges.ts              # routeInput, routeByTask
└── graph.ts              # StateGraph 构建 + compile

app/api/ai/asset-graph/
├── invoke/route.ts       # POST - 新输入
└── resume/route.ts       # POST - 用户确认后 resume
```

### 8. 命名统一（全栈）

| 旧命名 | 新命名 | 涉及位置 |
|---|---|---|
| `trade_record` | `operation` | State、API、前端、Prompt |
| `position` | `holding` | State、API、前端、Prompt |
| `ImageType` | `TaskType` | 类型定义 |
| `ImageParseOutput` | `ReviewPayload` | API 返回类型 |
| Prisma `Trade` model | Prisma `Operation` model | schema.prisma + DB migration |
| Prisma `Position` model | Prisma `Holding` model | schema.prisma + DB migration |
| `TradeParseSchema` | `OperationParseSchema` | Zod schema |
| `PositionParseSchema` | `HoldingParseSchema` | Zod schema |
| `TradeRow` | `OperationRow` | AssetConfirmTable 前端接口 |
| `PositionRow` | `HoldingRow` | AssetConfirmTable 前端接口 |

## Risks / Trade-offs

- **[LangGraph 引入复杂度]** → 全图无循环、纯线性，复杂度可控。每个 Node 不超过 50 行。若后续需要 retry/分支逻辑，Graph 结构可自然扩展。
- **[interrupt/resume 需要 checkpointer]** → 开发用 MemorySaver，生产用 PostgresSaver（复用现有 PG）。需注意 thread 过期清理。
- **[text_extract 去掉 tool calling 后精度可能下降]** → enrich 节点兜底补全，与图片路径一致。若发现文本路径精度不够，可后续在 text_extract 节点内恢复 tool calling 而不影响整体 Graph 结构。
- **[API 合并为单一入口]** → 前端 ChatInput 需改调新端点。旧 `/api/ai/parse` 和 `/api/ai/parse-text` 立即删除（无过渡期）。
- **[类型命名变更 (trade_record→operation)]** → 全栈统一修改（Prisma model、Zod schema、前端接口），需 DB migration。
- **[Prisma model 重命名]** → `Trade → Operation`、`Position → Holding`，需 `prisma migrate dev` 生成迁移脚本。现有数据如有则需迁移。

## Resolved Questions

- **thread 过期策略**：interrupt 后 30 分钟不 resume 视为过期，checkpointer 清理。过期后前端直接初始状态，不提示。
- **portfolioId 来源**：前端 AssetConfirmTable 增加 Portfolio 选择器作为用户必填项。用户选择已有 Portfolio 或输入名称创建新 Portfolio。
- **resume 时 threadId 过期**：返回 HTTP 410 Gone + `{ error: "上次解析结果已过期，请重新输入" }`。
- **tradedAt 默认值**：operation 的 tradedAt 为空时，check_missing 自动填充当天日期。
- **批量写入失败**：store_db 使用 Prisma transaction，整批回滚。
- **写入后刷新**：前端收到 store_db 成功后，`window.location.reload()` 刷新页面。
