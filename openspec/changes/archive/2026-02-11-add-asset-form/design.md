## Context

资产面板（`AssetPanel`，tab index 2）当前展示总净资产摘要、柱状图和资产配置表。表头右侧有一个 `+ Add Asset` 按钮，但点击后无任何交互。整个 UI 已大部分中文化，但 AssetPanel 内部文案仍为英文。

当前架构：
- `app/page.tsx`（client component）通过 `activeTab` state 控制 tab 切换，`activeTab === 2` 时渲染 `<AssetPanel />`
- `AssetPanel` 是一个纯展示组件，无内部 state
- 样式全部集中在 `app/globals.css`，使用 CSS 变量体系
- 类型定义在 `types/index.ts`，常量在 `lib/constants.ts`

## Goals / Non-Goals

**Goals:**

- 实现完整的"添加资产"表单视图，用户点击按钮后在 workspace 区域内切换展示
- 表单包含：资产类型选择器、Ticker 搜索框（含预览）、分类/币种/日期/数量/价格字段、操作按钮
- AssetPanel 及表单所有英文文案翻译为中文
- 表单视觉风格与现有设计体系完全一致（使用项目已有 CSS 变量、字体族）
- 表单为纯前端 UI，不涉及后端持久化

**Non-Goals:**

- 不实现真实的后端 API 或数据持久化
- 不实现 Ticker 搜索的真实异步请求（使用静态 mock 预览）
- 不实现表单校验规则或 error state
- 不改变 tab 路由架构或其他 tab 的内容

## Decisions

### 1. 视图切换方案：AssetPanel 内部 state

**选择**：在 `AssetPanel` 组件内部引入 `useState<"list" | "form">("list")` 管理视图模式。

**备选**：
- (A) 在 `page.tsx` 层面新增一个 tab — 会破坏现有 tab 结构
- (B) 使用路由（`/add-asset`）— 过重，表单属于 AssetPanel 子视图

**理由**：表单是 AssetPanel 的子功能，内聚在组件内部最简洁，不影响外层 tab 架构。

### 2. 表单组件独立文件

**选择**：新建 `components/dashboard/AddAssetForm.tsx` 作为独立组件，AssetPanel 根据 `view` state 条件渲染。

**理由**：AddAssetForm 包含类型选择器、搜索框、6+ 表单字段，代码量较大，独立文件保持可维护性。

### 3. 样式方案：复用 globals.css + 新增表单类

**选择**：在 `globals.css` 中新增 `form-container`、`form-grid`、`type-selector`、`type-option`、`btn`、`ticker-preview` 等类名，复用现有 CSS 变量。

**理由**：项目已有的样式体系完全基于 globals.css + CSS 变量，保持一致。

### 4. 常量管理

**选择**：在 `lib/constants.ts` 中新增 `ASSET_TYPES`、`ASSET_CATEGORIES`、`CURRENCIES` 常量数组。

**理由**：选择器选项属于配置数据，集中管理便于后续修改。

### 5. 表单数据不持久化

**选择**：点击"添加到组合"按钮后仅 `console.log` 表单数据并切回列表视图，不写入任何 store。

**理由**：当前无后端，先完成 UI 层面，后续迭代可接入数据层。

## Risks / Trade-offs

- **[风险] 表单纯 UI 无真实功能** → 用户体验不闭环。缓解：按钮点击后给出 toast 反馈或 console.log，明确标注为 UI 原型阶段。
- **[风险] globals.css 持续膨胀** → 后续可考虑 CSS Modules 或组件级样式拆分。当前阶段保持一致性优先。
- **[权衡] Ticker 搜索使用静态 mock** → 牺牲真实性，但避免引入 API 依赖，保持变更范围可控。
