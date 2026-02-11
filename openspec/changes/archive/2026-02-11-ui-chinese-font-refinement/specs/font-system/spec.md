## ADDED Requirements

### Requirement: 全局字体统一为等宽字体
系统 SHALL 将 body 及所有 UI 组件的默认字体设置为 `var(--font-family-mono)`。

#### Scenario: 页面加载后字体一致
- **WHEN** 用户访问任意页面
- **THEN** 所有文本（标签、标题、表格、导航）均使用 DM Mono 字体渲染

### Requirement: 数字字体使用苹方并提供跨平台 fallback
系统 SHALL 定义 `--font-family-number` CSS 变量，字体链为 `"PingFang SC", -apple-system, "Noto Sans SC", "Helvetica Neue", sans-serif`。

#### Scenario: macOS 用户查看数字
- **WHEN** 用户在 macOS 上查看大数字
- **THEN** 数字使用 PingFang SC 字体渲染

#### Scenario: 非 Apple 用户查看数字
- **WHEN** 用户在 Windows/Linux 上查看大数字
- **THEN** 数字降级使用 Noto Sans SC 或系统字体渲染

### Requirement: 字号层级协调
系统 SHALL 将字号范围控制在 12px~34px 之间，具体层级为：
- 表头 th: 12px
- 标签 .label / 导航: 13px
- Tab / 图例 / delta: 14px
- 资产名 / 金额: 15px
- 品牌名: 16px
- 总价值: 16px
- 子数字: 22px
- 大数字: 34px

#### Scenario: 字号视觉层级正确
- **WHEN** 用户查看仪表盘全貌
- **THEN** 最小字号不低于 12px，最大字号不超过 34px，层级间距均匀

### Requirement: 大数字与变化值同行显示
系统 SHALL 将总净资产大数字和涨跌 delta 值显示在同一行（通过 `.kpi-inline` flex 容器）。

#### Scenario: KPI 同行布局
- **WHEN** 用户查看总净资产区域
- **THEN** `$1,248,320.00` 和 `+$4,231.50 (0.34%)` 在同一行显示
