## Why

资产管理仪表盘的 UI 需要完成中文本地化并统一视觉风格。原始设计使用全英文文案和多种混合字体（serif / sans / mono），导致中文用户阅读体验差，且数字、标签、资产名称之间字号层级不协调，大数字过大而小标签过小。

## What Changes

- 全局字体统一为 `font-family-mono`（DM Mono），消除多字体混用的视觉噪音
- 数字字体增加苹方（PingFang SC）变量并配置跨平台 fallback（Noto Sans SC）
- 所有 UI 英文文案翻译为中文（交易所代码保持英文）
- 品牌名从「My Wealth OS」→「耐心猎人」，增加渐变下划线强化展示
- Tab 标签重命名：主投资组合→资产面板，现金储备→现金流
- 字号层级重新校准：小字放大（11px→13px）、大字缩小（42px→34px），整体范围收窄至 12~34px

## Capabilities

### New Capabilities
- `ui-localization`: UI 文案中文化，包括导航、标签、表头、资产名称、占位页面
- `font-system`: 全局字体系统统一为 mono，数字字体 PingFang SC 跨平台 fallback
- `brand-identity`: 品牌名更新为「耐心猎人」并强化视觉展示

### Modified Capabilities
<!-- 无已有 spec 需要修改 -->

## Impact

- `app/globals.css` — 字体变量、所有组件字号、品牌样式
- `lib/constants.ts` — 导航项、Tab 标签、图例文案
- `components/layout/MetaHeader.tsx` — 品牌名
- `components/dashboard/SummaryPanel.tsx` — KPI 标签中文化 + 同行布局
- `components/dashboard/DataPanel.tsx` — 表头、资产名中文化、字号调整
- `components/dashboard/TabsRow.tsx` — Tab 标签中文化
- `app/layout.tsx` — 页面标题 metadata
- `app/analysis/page.tsx`, `app/reports/page.tsx`, `app/settings/page.tsx`, `app/not-found.tsx` — 占位页面中文化
