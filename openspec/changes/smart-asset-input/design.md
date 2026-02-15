## Context

当前 `AddAssetModal` 使用 Tab 切换 `ScreenshotUpload`（截图上传）和 `AddAssetForm`（手动表单）。两者各自独立，截图上传仅 `console.log` 未对接后端解析，表单则需要用户手动搜索股票并逐字段填写。

已有的后端 AI 基础设施：
- `/api/upload` — 图片转 Base64
- `/api/ai/ocr` — 图片 OCR
- `/api/ai/parse` — 图片分类 + 结构化提取（trade_record / position / unknown）
- `lib/ai/client.ts` — `chatCompletion()` (文本) + `visionCompletion()` (图片)
- `lib/ai/image-pipeline/` — 分类器 + trade/position 解析器 + Zod Schema

## Goals / Non-Goals

**Goals:**
- 将截图上传与文本输入合并为一个统一的 ChatGPT 风格输入框
- 支持自然语言描述交易/持仓，AI 解析为结构化数据
- 支持图片上传（可附带文字说明），复用现有 image-pipeline
- AI 解析结果以可编辑表格展示，用户可修改后确认
- AI Feature 快捷按钮注入 prompt template 降低输入门槛

**Non-Goals:**
- 多轮对话能力（单轮输入 → 解析 → 确认）
- 实际持久化到数据库（当前 submit 仍为 console.log，落库是后续任务）
- 全局 AI 侧栏（仅在"添加资产" Modal 内）

## Decisions

### 1. 组件架构：三层分离

```
AddAssetModal
├── FeatureBar          — AI 快捷按钮组
├── ChatInput           — 统一输入框（文本 + 图片）
└── AssetConfirmTable   — 可编辑结果表格 + 确认按钮
```

**为什么不用一个大组件？** 三层各自职责清晰：FeatureBar 只管注入文本；ChatInput 只管收集输入和调用 API；AssetConfirmTable 只管展示/编辑/提交。

### 2. AI Feature 按钮：prompt template injection

点击按钮 → 向 textarea 注入预设文本 + focus。不触发模式切换，不改变后端调用逻辑。

预设按钮：
| 按钮 | 注入文本 |
|---|---|
| 录入交易 | `我执行了以下交易：\n` |
| 解析持仓 | `请帮我解析以下持仓信息：\n` |
| 批量导入 | `以下是我的多笔交易记录：\n` |

**为什么选 injection 而不是 mode switch？** 简单、无状态、用户可自由编辑注入的文本。

### 3. 文本解析：新增 `/api/ai/parse-text`

使用 `chatCompletion()` + 结构化 prompt，返回与 image-pipeline 一致的结构（trades[] / positions[]）。

复用 `lib/ai/image-pipeline/types.ts` 中的 `TradeItemSchema` 和 `PositionItemSchema`，确保文本解析和图片解析输出格式一致。

**备选方案：用 withStructuredOutput。** 但当前 `chatCompletion` 已经够用，且 image-pipeline 的 parser 已经用 Zod schema 做 structured output。文本解析场景简单，直接在 prompt 中要求 JSON 输出 + 前端 JSON.parse 即可。后续如需更严格可升级。

### 4. 图片 + 文字混合输入

当用户同时上传图片和输入文字时：
1. 前端先调 `/api/upload` 获取 Base64
2. 将 Base64 + 用户文字一起发给增强版 `/api/ai/parse`（新增 `context` 字段）
3. 后端在 vision prompt 中附加用户文字作为上下文

纯文字输入 → 调 `/api/ai/parse-text`
纯图片输入 → 调 `/api/upload` + `/api/ai/parse`
图片+文字 → 调 `/api/upload` + 增强 `/api/ai/parse`

### 5. 可编辑确认表格

解析结果映射为表格行，每个字段可编辑。字段包括：
- 操作（买入/卖出） — select
- 股票代码 — text input
- 股票名称 — text（只读，可通过代码自动填充）
- 数量 — number input
- 价格 — number input
- 币种 — select (USD/HKD/CNY)
- 日期 — date input
- 风险分类 — select

AI 无法推断的字段标记为空，用高亮提示用户补充。

### 6. Modal 尺寸与布局

保持现有 Modal 壳（max-width 720px），内部从 Tab 布局改为垂直流式布局：
- FeatureBar 在顶部
- ChatInput 居中
- 解析后 ChatInput 收起，AssetConfirmTable 展开

## Risks / Trade-offs

- **[LLM 解析不准确]** → 可编辑表格作为安全网，用户可修正任何字段。AI 结果不直接落库。
- **[文本解析格式多样]** → prompt 中明确列出支持的格式（中文/英文、单笔/多笔），并提供 few-shot examples。
- **[图片+文字混合的 API 设计]** → `/api/ai/parse` 新增可选 `context` 字段，向后兼容，不影响现有纯图片调用。
- **[ScreenshotUpload 删除]** → 其拖拽上传 + 预览的 UI 逻辑需要迁移到 ChatInput 中，增加 ChatInput 复杂度。缓解：ChatInput 中图片预览做成独立子组件 `ImagePreviewList`。
