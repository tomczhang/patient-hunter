## Why

仪表盘 Tab 命名需优化以更准确反映功能：「资产面板」→「仓位水位」、「退休金 (IRA)」→「资产面板」。同时「资产面板」Tab 需要实现全新的 Portfolio Main 视图，包含净资产摘要卡片、柱状图和资产配置表格。

## What Changes

- Tab 重命名：「资产面板」→「仓位水位」，「退休金 (IRA)」→「资产面板」
- 新增「资产面板」Tab 内容：
  - 总净资产摘要卡片（$842,291.50 + 年化趋势 +12.4%）
  - 10 根柱状图的投资组合表现面板
  - 资产配置表格（AAPL/VOO/CASH，含分配比例进度条 + 表现指标）
  - 「+ 添加资产」按钮
- TabsRow 改为支持 Tab 内容切换（条件渲染不同面板）
- 新增 CSS 样式：dashboard-grid / card / value-large / trend / chart-block / bar / allocation-pill 等

## Capabilities

### New Capabilities
- `asset-panel-view`: 资产面板 Tab 的全新 dashboard grid 视图，包含摘要卡片、柱状图、资产配置表格
- `tab-content-switch`: Tab 切换时显示不同面板内容

### Modified Capabilities

## Impact

- `lib/constants.ts` — PORTFOLIO_TABS 标签重命名
- `components/dashboard/TabsRow.tsx` — 需要暴露 activeTab 状态或改为受控组件
- `app/page.tsx` — 根据 activeTab 条件渲染不同面板
- `app/globals.css` — 新增 dashboard-grid / card / bar chart / allocation-pill 等样式
- `components/dashboard/AssetPanel.tsx` — 新建：资产面板视图组件
- `types/index.ts` — 新增 Asset 类型
