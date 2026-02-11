## Context

当前 `AssetPanel` 使用 `useState<"list" | "form">` 在资产列表和添加表单之间做视图级切换，表单占据整个 workspace 区域，用户丢失资产列表上下文。现需改为弹窗模式，并新增截图上传录入方式。

现有架构：
- `AssetPanel.tsx`：管理 `view` state，条件渲染 `AddAssetForm` 或列表
- `AddAssetForm.tsx`：独立表单组件，外层 `.form-container` 提供 max-width 680px 居中布局
- 样式全部在 `globals.css`，使用 CSS 变量体系
- 无通用 Modal 组件

## Goals / Non-Goals

**Goals:**

- 将添加资产交互改为弹窗模式，用户可随时关闭回到列表
- 弹窗内提供"上传截图"和"填写表单"两种录入模式 Tab 切换
- 上传截图支持点击选择文件和拖拽上传，支持常见图片格式（jpg/png/webp）
- 上传后展示图片预览，可删除重传
- 填写表单复用现有 `AddAssetForm` 的字段逻辑
- 新增通用 Modal 组件，可复用于其他场景
- 支持 ESC 键关闭弹窗、点击遮罩层关闭

**Non-Goals:**

- 不实现大模型 API 调用和截图分析（后续单独 change）
- 不实现真实的后端文件上传（仅前端 FileReader 读取预览）
- 不实现表单校验
- 不改变其他 tab 的功能

## Decisions

### 1. 通用 Modal 组件

**选择**：新建 `components/ui/Modal.tsx`，使用 React Portal 渲染到 `document.body`，包含遮罩层、居中容器、ESC 键关闭。

**备选**：
- (A) 在 AssetPanel 内部用 absolute/fixed 定位实现 — 不可复用，z-index 管理混乱
- (B) 使用第三方库（如 headlessui/dialog）— 增加依赖，当前需求简单

**理由**：Portal 方式确保弹窗在 DOM 最顶层渲染，避免被父级 overflow/z-index 影响；组件足够简单，无需引入第三方库。

### 2. 弹窗组合组件 AddAssetModal

**选择**：新建 `components/dashboard/AddAssetModal.tsx` 作为弹窗内容组件，内部管理 Tab 切换（"上传截图" / "填写表单"），通过 `<Modal>` 包裹渲染。

**理由**：将弹窗业务逻辑与通用 Modal 分离，AddAssetModal 负责 Tab 状态和两种模式的渲染。

### 3. Tab 切换方案

**选择**：弹窗顶部使用两个 Tab 按钮，用 `useState<"screenshot" | "form">` 管理活跃 Tab，默认展示"上传截图"。

**理由**：两种录入方式是互斥的，用简单 state 即可。默认"上传截图"因为这是本次新增的核心能力。

### 4. 截图上传组件

**选择**：新建 `components/dashboard/ScreenshotUpload.tsx`，使用 `<input type="file" accept="image/*">` + 拖拽区域（onDragOver/onDrop），通过 `FileReader.readAsDataURL` 生成本地预览。

**状态管理**：
- `file: File | null` — 上传的文件对象
- `preview: string | null` — base64 预览 URL
- `isDragging: boolean` — 拖拽悬停状态

**理由**：纯前端读取，无需后端。base64 预览足以满足当前需求，后续接入 LLM 时可将 File 对象发送到 API。

### 5. AssetPanel 改造

**选择**：移除 `view` state，改为 `showModal: boolean`。按钮点击设 `setShowModal(true)`，弹窗关闭回调设 `setShowModal(false)`。

**理由**：逻辑更简洁，AssetPanel 始终渲染列表，弹窗独立覆盖。

### 6. AddAssetForm 适配

**选择**：保留 `AddAssetForm` 组件，移除外层 `.form-container` 包装（由弹窗提供容器）。`onCancel` 回调含义从"回到列表"变为"关闭弹窗"，代码无需修改。

**理由**：最小改动，表单字段逻辑完全复用。

## Risks / Trade-offs

- **[风险] Modal Portal 的 SSR 兼容** → 使用 `"use client"` 指令 + `useEffect` 确保仅客户端渲染 Portal。
- **[风险] 大图片预览性能** → FileReader 同步读取大文件可能卡顿。缓解：可限制文件大小（如 10MB），当前阶段暂不处理。
- **[权衡] 截图上传后无实际处理** → 本次仅做 UI 展示，用户上传后只能看到预览。下一个 change 接入 LLM 分析后才有完整闭环。弹窗中可放置"等待分析"占位提示。
- **[权衡] globals.css 持续膨胀** → 新增 modal/upload 样式约 100 行。后续可考虑 CSS Modules 拆分。
