## Context

当前项目 patient-hunter 是基于 Next.js 16 (App Router) + Tailwind CSS 的资产管理仪表盘。初始设计使用全英文文案、多种 Google Fonts（DM Sans / DM Mono / Domine）混合排版。需要完成中文本地化、统一字体风格、校准字号层级。

## Goals / Non-Goals

**Goals:**
- 全局字体统一为等宽字体（DM Mono），建立一致的技术/金融视觉风格
- 数字使用苹方字体并提供跨平台 fallback
- UI 文案全面中文化（交易所代码保持英文）
- 品牌「耐心猎人」强化展示
- 字号层级重新校准，消除过大/过小的极端值

**Non-Goals:**
- 不做国际化框架（i18n）集成，本次仅硬编码中文
- 不调整布局结构或配色方案
- 不引入新的组件库或 UI 框架

## Decisions

### D1: 字体统一为 mono 而非 sans
**选择**: `font-family-mono` (DM Mono) 作为全局唯一字体
**原因**: 等宽字体在金融/数据类应用中具有天然优势 — 数字对齐、表格可读性高、技术感强。serif 和 sans 混用导致视觉不统一。
**替代方案**: 保持多字体 → 放弃，因为三种字体混排在中文环境下尤其混乱。

### D2: 数字字体选择苹方而非系统字体
**选择**: `"PingFang SC", -apple-system, "Noto Sans SC", "Helvetica Neue", sans-serif`
**原因**: 苹方在 macOS/iOS 上渲染效果最佳，Noto Sans SC 作为 Linux/Windows 的 fallback 确保跨平台一致性。
**替代方案**: 仅用 DM Mono → 放弃，因为 mono 字体的数字过于紧凑不适合大号展示。

### D3: 字号层级压缩至 12~34px
**选择**: 小字从 11px 提升至 12~13px，大数字从 42px 缩至 34px
**原因**: 原始设计的 11px 标签在 HiDPI 以外的屏幕上难以阅读，42px 的大数字在 320px 宽的侧栏中过于占据空间。
**替代方案**: 保持原字号 → 放弃，用户反馈比例不协调。

### D4: 硬编码中文而非 i18n 框架
**选择**: 直接在 constants.ts 和组件中写中文
**原因**: 项目当前阶段无需多语言支持，引入 i18n 增加不必要的复杂度。
**替代方案**: next-intl → 过度工程化，后续需要时再迁移。

## Risks / Trade-offs

- **[DM Mono 中文字符缺失]** → DM Mono 只包含 latin 子集，中文字符会 fallback 到系统字体。在混排时字体宽度可能不一致。可接受，因为中文标签和英文数字很少出现在同一个 token 内。
- **[苹方字体非跨平台]** → 非 Apple 设备上降级为 Noto Sans SC 或系统字体。已通过 fallback 链缓解。
- **[硬编码中文不可扩展]** → 未来需要多语言时需重构。当前阶段可接受。
