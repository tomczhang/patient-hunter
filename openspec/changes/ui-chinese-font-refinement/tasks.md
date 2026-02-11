## 1. 字体系统

- [x] 1.1 在 globals.css :root 中添加 --font-family-number 变量（PingFang SC + 跨平台 fallback）
- [x] 1.2 将 body 默认字体改为 var(--font-family-mono)
- [x] 1.3 将 .big-number / .sub-number / .delta 字体改为 mono
- [x] 1.4 将 .asset-name / .asset-ticker / .asset-amount 字体改为 mono
- [x] 1.5 添加 .kpi-inline flex 容器实现大数字与 delta 同行

## 2. 字号层级校准

- [x] 2.1 .label 从 11px 调整为 13px
- [x] 2.2 .meta-header 从 12px 调整为 13px
- [x] 2.3 .tab 从 13px 调整为 14px
- [x] 2.4 .legend-item 从 13px 调整为 14px
- [x] 2.5 .table-grid th 从 11px 调整为 12px
- [x] 2.6 .big-number 从 42px 调整为 34px
- [x] 2.7 .sub-number 从 24px 调整为 22px
- [x] 2.8 .asset-name 从 18px 调整为 15px
- [x] 2.9 .asset-amount 从 16px 调整为 15px
- [x] 2.10 .brand 从 18px 调整为 16px
- [x] 2.11 DataPanel 总价值 inline style 从 18px 调整为 16px

## 3. UI 文案中文化

- [x] 3.1 constants.ts: NAV_ITEMS 标签改为中文（仪表盘/分析/报告/设置）
- [x] 3.2 constants.ts: PORTFOLIO_TABS 改为中文（资产面板/现金流/退休金/关注列表）
- [x] 3.3 constants.ts: ALLOCATION_LEGEND 改为中文（美股/国际股票/现金及等价物）
- [x] 3.4 SummaryPanel: KPI 标签改为中文（总净资产/年化收益率/资产配置）
- [x] 3.5 DataPanel: 表头改为中文（资产/权重/价格/总价值）
- [x] 3.6 DataPanel: 资产名称改为中文（苹果公司/先锋全股市指数/高收益储蓄/特斯拉），交易所代码保持英文
- [x] 3.7 DataPanel: section-header 改为中文（持仓资产/更新于）

## 4. 品牌标识

- [x] 4.1 MetaHeader: 品牌名改为「耐心猎人」
- [x] 4.2 globals.css: 添加 .brand 样式（16px/700/0.15em/渐变下划线）
- [x] 4.3 layout.tsx: metadata title 改为「耐心猎人 — 资产管理」

## 5. 占位页面中文化

- [x] 5.1 analysis/page.tsx 占位文案中文化
- [x] 5.2 reports/page.tsx 占位文案中文化
- [x] 5.3 settings/page.tsx 占位文案中文化
- [x] 5.4 not-found.tsx 占位文案中文化
