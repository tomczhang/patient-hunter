## 1. Tab 重命名

- [x] 1.1 constants.ts: PORTFOLIO_TABS 改为 ["仓位水位", "现金流", "资产面板", "关注列表"]

## 2. Tab 切换机制

- [x] 2.1 TabsRow 改为受控组件，接收 activeTab + onTabChange props
- [x] 2.2 page.tsx 管理 activeTab 状态，根据 tab 条件渲染不同面板

## 3. 资产面板视图

- [x] 3.1 types/index.ts 新增 Asset 接口
- [x] 3.2 新建 components/dashboard/AssetPanel.tsx，实现 dashboard-grid 布局
- [x] 3.3 实现摘要卡片（总净资产 + 年化趋势）
- [x] 3.4 实现柱状图面板（10 根 bar）
- [x] 3.5 实现资产配置表格（3 行 mock 数据 + 分配进度条）
- [x] 3.6 实现「+ 添加资产」按钮

## 4. CSS 样式

- [x] 4.1 globals.css 新增 --accent-green 变量
- [x] 4.2 新增 dashboard-grid / card / summary-block / chart-block 样式
- [x] 4.3 新增 value-large / trend 样式
- [x] 4.4 新增 bar 柱状图样式
- [x] 4.5 新增 assets-table-container / section-title / allocation-pill / btn-add 样式
