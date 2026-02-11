## ADDED Requirements

### Requirement: Tab 切换显示对应内容
系统 SHALL 根据当前激活的 Tab 渲染对应面板内容：「仓位水位」显示原有 SummaryPanel + DataPanel，「资产面板」显示新的 AssetPanel。

#### Scenario: 切换到仓位水位
- **WHEN** 用户点击「仓位水位」Tab
- **THEN** workspace 内显示 SummaryPanel 和 DataPanel

#### Scenario: 切换到资产面板
- **WHEN** 用户点击「资产面板」Tab
- **THEN** workspace 内显示 AssetPanel（dashboard-grid 布局）

### Requirement: Tab 标签重命名
系统 SHALL 将 PORTFOLIO_TABS 更新为：仓位水位、现金流、资产面板、关注列表。

#### Scenario: Tab 标签正确显示
- **WHEN** 用户查看 Tab 栏
- **THEN** 依次显示「仓位水位」「现金流」「资产面板」「关注列表」
