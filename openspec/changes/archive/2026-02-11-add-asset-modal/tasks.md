## 1. 通用 Modal 组件

- [x] 1.1 新建 `components/ui/Modal.tsx`，使用 React Portal 渲染到 document.body
- [x] 1.2 实现遮罩层（rgba(0,0,0,0.4)、覆盖视口、点击关闭）
- [x] 1.3 实现居中容器（max-width 720px、圆角 20px、白色背景、阴影、可滚动）
- [x] 1.4 实现关闭按钮（右上角 ×）
- [x] 1.5 实现 ESC 键关闭（useEffect + keydown 监听）
- [x] 1.6 在 `globals.css` 中新增 `.modal-overlay`、`.modal-container`、`.modal-close` 样式

## 2. AddAssetModal 弹窗业务组件

- [x] 2.1 新建 `components/dashboard/AddAssetModal.tsx`，接收 `open: boolean` 和 `onClose: () => void` props
- [x] 2.2 实现弹窗标题区域（"新增资产" + 副标题）
- [x] 2.3 实现 Tab 切换 UI（"上传截图" / "填写表单"），默认选中"上传截图"
- [x] 2.4 根据 Tab state 条件渲染 `ScreenshotUpload` 或 `AddAssetForm`
- [x] 2.5 在 `globals.css` 中新增 `.modal-tabs`、`.modal-tab`、`.modal-tab.active` 样式

## 3. ScreenshotUpload 截图上传组件

- [x] 3.1 新建 `components/dashboard/ScreenshotUpload.tsx`
- [x] 3.2 实现空状态上传区域（虚线边框、上传图标、提示文案、支持格式说明）
- [x] 3.3 实现点击上传（隐藏 input[type=file]，accept=image/*，点击区域触发）
- [x] 3.4 实现拖拽上传（onDragOver/onDragLeave/onDrop 事件处理，拖拽悬停高亮）
- [x] 3.5 实现 FileReader 读取图片生成 base64 预览
- [x] 3.6 实现预览状态展示（图片预览 max-height 400px、文件名、文件大小）
- [x] 3.7 实现删除按钮（清除预览恢复空状态）
- [x] 3.8 实现"确认提交"按钮（有预览时可点击，无预览时禁用；点击后 console.log + 调用 onClose）
- [x] 3.9 在 `globals.css` 中新增 `.upload-dropzone`、`.upload-dropzone.dragging`、`.upload-preview`、`.upload-file-info` 样式

## 4. AssetPanel 改造

- [x] 4.1 移除 `AssetPanel.tsx` 中的 `view` state 和 `AddAssetForm` 直接渲染逻辑
- [x] 4.2 新增 `showModal: boolean` state，按钮 onClick 设为 `setShowModal(true)`
- [x] 4.3 在 AssetPanel 底部渲染 `<AddAssetModal open={showModal} onClose={() => setShowModal(false)} />`

## 5. AddAssetForm 适配

- [x] 5.1 移除 `AddAssetForm.tsx` 中的外层 `.form-container` div（由弹窗提供容器）
- [x] 5.2 确保 onCancel 回调正确关闭弹窗

## 6. 验证

- [x] 6.1 确认点击"+ 添加资产"弹出弹窗，资产列表保持可见
- [x] 6.2 确认弹窗内 Tab 切换正常（上传截图 ↔ 填写表单）
- [x] 6.3 确认截图上传：点击上传、拖拽上传、预览、删除
- [x] 6.4 确认填写表单 Tab 内容正常显示
- [x] 6.5 确认弹窗关闭：点击遮罩、ESC 键、关闭按钮、放弃草稿、添加到组合
