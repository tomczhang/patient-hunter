## Why

当前"新增资产"弹窗采用 Tab 切换模式（上传截图 / 填写表单），用户需要先选择输入方式再操作。两种方式割裂，且表单输入成本高。希望将其改为 ChatGPT 风格的统一输入框：用户直接用自然语言描述交易或粘贴截图，AI 解析后以可编辑表格展示结果，用户确认后落库。核心目标是 **最低输入成本 + 结构化确认**。

## What Changes

- **移除** `AddAssetModal` 中的 Tab 切换（"上传截图" / "填写表单"）
- **新增** ChatGPT 风格统一输入框，支持文本输入 + 图片上传（同时）
- **新增** AI Feature 快捷按钮组（prompt template shortcuts），位于输入框上方
- **新增** AI 解析结果以可编辑表格展示，用户可修改后确认
- **新增** 文本解析 API（`/api/ai/parse-text`），将自然语言描述转为结构化交易/持仓数据
- **增强** 现有图片解析 API，支持附带用户文字上下文
- **移除** `ScreenshotUpload` 组件（功能合并到新输入框）
- **重构** `AddAssetForm` 为确认/编辑层（不再是主输入入口）

## Capabilities

### New Capabilities
- `chat-input`: ChatGPT 风格输入框组件，支持多行文本 + 图片上传 + 发送，含 AI Feature 快捷按钮注入 prompt template
- `text-parse-api`: 文本解析 API，将自然语言描述的交易/持仓信息转为结构化数据
- `asset-confirm-table`: 可编辑的资产确认表格，展示 AI 解析结果，支持用户修改缺失字段后确认落库

### Modified Capabilities
- `add-asset-form`: 从主输入入口改为 AI 解析结果的确认/编辑层，移除 Tab 切换和独立截图上传

## Impact

- **前端组件**: `AddAssetModal.tsx`（重写）、`ScreenshotUpload.tsx`（删除）、`AddAssetForm.tsx`（重构为确认层）、新增 `ChatInput.tsx`、`FeatureBar.tsx`、`AssetConfirmTable.tsx`
- **API**: 新增 `/api/ai/parse-text`，增强 `/api/ai/parse`（支持附带文字上下文）
- **依赖**: 无新增外部依赖，复用现有 `lib/ai/client.ts`（chatCompletion / visionCompletion）
- **CSS**: `globals.css` 新增输入框、按钮组、可编辑表格样式
