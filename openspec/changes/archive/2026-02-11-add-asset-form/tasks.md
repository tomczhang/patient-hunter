## 1. 常量与类型定义

- [x] 1.1 在 `lib/constants.ts` 中新增 `ASSET_TYPES` 常量数组（包含 icon SVG path、中文 label：股票、ETF/基金、加密货币、房产）
- [x] 1.2 在 `lib/constants.ts` 中新增 `ASSET_CATEGORIES` 常量数组（科技、金融、医疗、能源、消费必需品）
- [x] 1.3 在 `lib/constants.ts` 中新增 `CURRENCIES` 常量数组（USD、EUR、GBP 带中文标注）
- [x] 1.4 在 `types/index.ts` 中新增 `AssetTypeOption` 接口（icon、label、id）

## 2. AssetPanel 中文化

- [x] 2.1 将 AssetPanel 摘要卡片文案改为中文（"Total Net Worth" → "总净资产"、"+12.4% this year" → "今年 +12.4%"）
- [x] 2.2 将柱状图标签改为中文（"Portfolio Performance" → "投资组合表现"）
- [x] 2.3 将表格标题改为中文（"Asset Allocation" → "资产配置"）
- [x] 2.4 将按钮文案改为中文（"+ Add Asset" → "+ 添加资产"）
- [x] 2.5 将表格列头改为中文（"Asset Name" → "资产名称"、"Category" → "类别"、"Allocation" → "分配比例"、"Current Value" → "当前价值"、"Performance" → "表现"）

## 3. AssetPanel 视图切换逻辑

- [x] 3.1 在 `AssetPanel` 中引入 `useState<"list" | "form">("list")` 管理视图模式
- [x] 3.2 将 `+ 添加资产` 按钮的 `<a>` 改为 `<button>`，点击时 `setView("form")`
- [x] 3.3 根据 `view` state 条件渲染：`"list"` 时展示原有 dashboard-grid，`"form"` 时渲染 `<AddAssetForm onCancel={...} />`

## 4. AddAssetForm 组件

- [x] 4.1 新建 `components/dashboard/AddAssetForm.tsx`，接收 `onCancel: () => void` prop
- [x] 4.2 实现表单标题区域（"新增资产" + 中文副标题）
- [x] 4.3 实现资产类型选择器（4 格网格、图标 + 中文标签、选中高亮、默认选中"股票"）
- [x] 4.4 实现 Ticker 搜索框（全宽 input、搜索图标、placeholder "按名称或代码搜索（如 MSFT）…"）
- [x] 4.5 实现 Ticker 预览区域（静态 mock：MSFT chip + "Microsoft Corporation" + "NASDAQ"）
- [x] 4.6 实现 2 列表单字段网格（分类 select、币种 select、购入日期 date、数量 number、每股价格 text、总成本 disabled text）
- [x] 4.7 实现操作按钮区域（"放弃草稿" → 调用 onCancel、"添加到组合" → console.log + 调用 onCancel）

## 5. CSS 样式

- [x] 5.1 在 `globals.css` 中新增 `.form-container` 样式（max-width 680px、居中）
- [x] 5.2 新增 `.form-grid` 样式（2 列网格、gap 24px）
- [x] 5.3 新增 `.form-group` 和 `.form-group.full-width` 样式
- [x] 5.4 新增 `.type-selector` 和 `.type-option` / `.type-option.selected` 样式
- [x] 5.5 新增 `.search-wrapper` / `.search-icon` 样式
- [x] 5.6 新增 `.ticker-preview` / `.ticker-chip` 样式
- [x] 5.7 新增 `.form-actions` / `.btn` / `.btn-secondary` / `.btn-primary` 样式
- [x] 5.8 新增 `input` / `select` 全局表单控件样式（圆角、边框、focus 态）
- [x] 5.9 新增 `.section-subtitle` 样式

## 6. 验证

- [x] 6.1 确认资产面板列表视图所有文案为中文
- [x] 6.2 确认点击 `+ 添加资产` 切换到表单视图
- [x] 6.3 确认表单所有字段、标签、按钮为中文
- [x] 6.4 确认点击"放弃草稿"和"添加到组合"均能返回列表视图
