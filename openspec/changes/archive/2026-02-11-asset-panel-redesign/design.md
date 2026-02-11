## Context

当前仪表盘只有一个固定视图（仓位水位 + 数据面板），Tab 切换仅改变 active 状态但不改变内容。需要实现 Tab 内容切换机制，并为「资产面板」Tab 构建全新的 dashboard grid 布局。

## Goals / Non-Goals

**Goals:**
- Tab 切换驱动不同面板内容渲染
- 资产面板视图忠实还原 HTML 设计：12 列 grid / 摘要卡片 / 柱状图 / 资产表格
- 新增 CSS 变量 `--accent-green` 用于涨幅指标
- 保持现有仓位水位视图不变

**Non-Goals:**
- 不实现真实数据获取（使用 mock 数据）
- 不实现「+ 添加资产」的实际功能
- 不修改现金流 / 关注列表 Tab 的内容

## Decisions

### D1: Tab 切换方案 — 提升 state 到 page 层
**选择**: 将 TabsRow 的 activeTab 状态提升到 page.tsx，通过 props 传递
**原因**: page.tsx 需要根据 activeTab 决定渲染哪个面板，状态必须在父组件
**替代方案**: 使用路由切换 → 过重，Tab 切换应该是客户端即时的

### D2: 资产面板作为独立组件
**选择**: 新建 `components/dashboard/AssetPanel.tsx`
**原因**: 该视图有独立的 grid 布局和数据结构，不应与现有 SummaryPanel/DataPanel 混合
**替代方案**: 复用 DataPanel → 结构差异太大，强行复用反而增加复杂度

### D3: CSS 新增而非覆盖
**选择**: 在 globals.css 追加新样式类，不修改已有类
**原因**: 仓位水位视图仍需使用原有样式，新增类避免冲突

## Risks / Trade-offs

- **[page.tsx 变为 client component]** → 因为 useState 需要 "use client"。可接受，dashboard 页面本身需要交互。
- **[Mock 数据硬编码]** → 后续需要替换为 API 调用。当前阶段可接受。
