## 1. 后端 API

- [x] 1.1 新增 `/api/ai/parse-text` — 文本解析接口，接收 `{ text }` 返回结构化交易/持仓数据
- [x] 1.2 增强 `/api/ai/parse` — 新增可选 `context` 字段，将用户文字上下文注入 Vision prompt

## 2. FeatureBar 组件

- [x] 2.1 创建 `FeatureBar.tsx` — AI 快捷按钮组（录入交易 / 解析持仓 / 批量导入），点击注入 prompt template 到 textarea

## 3. ChatInput 组件

- [x] 3.1 创建 `ChatInput.tsx` — 多行 textarea + auto-resize + 发送按钮 + 禁用态控制
- [x] 3.2 实现图片上传功能 — 点击按钮 / 拖拽上传，缩略图预览列表 + 删除
- [x] 3.3 实现发送逻辑 — 根据输入类型（纯文本 / 纯图片 / 混合）路由到对应 API

## 4. AssetConfirmTable 组件

- [x] 4.1 创建 `AssetConfirmTable.tsx` — 根据解析结果 type（trade_record / position）渲染对应列的可编辑表格
- [x] 4.2 实现字段编辑 — 各列可编辑（text input / select / date / number），缺失字段高亮提示
- [x] 4.3 实现风险分类选择器 — 表格下方的补充字段
- [x] 4.4 实现操作按钮 — 确认添加（console.log）/ 重新输入 / 逐行删除

## 5. AddAssetModal 重构

- [x] 5.1 重写 `AddAssetModal.tsx` — 移除 Tab 切换，集成 FeatureBar + ChatInput + AssetConfirmTable
- [x] 5.2 实现状态流转 — 输入态 → loading → 结果态 → 输入态（重新输入）

## 6. 清理与样式

- [x] 6.1 删除 `ScreenshotUpload.tsx`（功能已合并到 ChatInput）
- [x] 6.2 新增 CSS 样式 — 输入框、按钮组、缩略图预览、可编辑表格、高亮提示
