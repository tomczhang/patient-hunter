## Why

资产面板（AssetPanel）目前仅能展示已有资产列表，缺少添加新资产的能力。用户点击"+ Add Asset"按钮后没有任何交互响应。需要实现一个完整的"添加资产"表单视图，同时将按钮和表单中的英文文案统一翻译为中文，保持 UI 语言一致性。

## What Changes

- 将 AssetPanel 中的 `+ Add Asset` 按钮文案改为 `+ 添加资产`
- 将 AssetPanel 中所有英文文案（表头、标签等）翻译为中文
- 新增"添加资产"表单组件（`AddAssetForm`），包含：
  - 资产类型选择器（股票、ETF/基金、加密货币、房产）
  - Ticker 代码搜索框（含搜索预览）
  - 分类、币种、购入日期、数量、每股价格、总成本字段
  - 取消 / 确认提交按钮
- 点击 `+ 添加资产` 按钮后，在 workspace 区域切换展示表单视图；点击取消或提交后返回资产列表视图
- 新增表单相关 CSS 样式（form-container, form-grid, type-selector 等）

## Capabilities

### New Capabilities

- `add-asset-form`: 添加资产表单视图，包含资产类型选择、搜索、表单字段、提交/取消交互
- `asset-panel-i18n`: 资产面板中英文文案统一翻译为中文

### Modified Capabilities

_(无已有 spec 需要修改)_

## Impact

- **组件**: `components/dashboard/AssetPanel.tsx` — 新增视图切换逻辑，按钮文案更新
- **新组件**: `components/dashboard/AddAssetForm.tsx` — 全新表单组件
- **样式**: `app/globals.css` — 新增表单相关 CSS（form-container, form-grid, type-selector, btn, ticker-preview 等）
- **类型**: `types/index.ts` — 可能新增 `AssetType` 枚举和表单相关类型
- **常量**: `lib/constants.ts` — 新增资产类型列表、分类列表、币种列表等常量
