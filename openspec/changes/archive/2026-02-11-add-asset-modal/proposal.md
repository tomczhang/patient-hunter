## Why

当前"添加资产"功能采用视图替换方式（整个 workspace 被表单替换），用户无法同时看到已有资产列表，上下文丢失。此外仅支持手动填写表单，缺少更便捷的录入方式。需要改为弹窗模式，同时新增"上传截图"录入方式，为后续接入大模型 OCR 分析做准备。

## What Changes

- 将"添加资产"交互从视图替换改为弹窗（Modal Overlay），点击"+ 添加资产"按钮弹出模态框
- 弹窗内提供两种录入模式的 Tab 切换：**上传截图** 和 **填写表单**
- "上传截图"模式：唤起浏览器文件上传（accept image），支持拖拽上传，上传后展示图片预览，提供删除/重新上传操作
- "填写表单"模式：复用现有 AddAssetForm 的表单字段内容（表单搬入弹窗内部）
- AssetPanel 不再使用 `view` state 做视图切换，改为 `showModal` boolean 控制弹窗显隐
- 新增 Modal 通用组件（遮罩层 + 居中容器 + 关闭按钮 + ESC 键关闭）

## Capabilities

### New Capabilities

- `add-asset-modal`: 添加资产弹窗，包含 Tab 切换、上传截图、填写表单两种录入模式
- `screenshot-upload`: 截图上传能力，包含文件选择、拖拽上传、图片预览、删除重传

### Modified Capabilities

- `add-asset-form`: 表单从独立视图改为嵌入弹窗内部，取消/提交后关闭弹窗而非切换视图

## Impact

- **组件**: `components/dashboard/AssetPanel.tsx` — 移除 view state，改为 showModal state
- **组件**: `components/dashboard/AddAssetForm.tsx` — onCancel 语义从"返回列表"改为"关闭弹窗"，移除外层 form-container（由弹窗提供容器）
- **新组件**: `components/ui/Modal.tsx` — 通用弹窗组件（遮罩 + 容器 + 关闭）
- **新组件**: `components/dashboard/AddAssetModal.tsx` — 添加资产弹窗，包含 Tab 切换和两种录入模式
- **新组件**: `components/dashboard/ScreenshotUpload.tsx` — 截图上传组件（文件选择 + 拖拽 + 预览）
- **样式**: `app/globals.css` — 新增 modal overlay、tab switch、upload dropzone 等样式
- **类型**: `types/index.ts` — 可能新增 UploadState 等类型
