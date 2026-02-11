## ADDED Requirements

### Requirement: 品牌名更新为「耐心猎人」
系统 SHALL 将顶部导航栏左侧品牌名从「My Wealth OS」更新为「耐心猎人」。

#### Scenario: 用户查看品牌名
- **WHEN** 用户访问任意页面
- **THEN** 左上角显示「耐心猎人」

### Requirement: 品牌名强化视觉展示
系统 SHALL 对品牌名应用以下视觉增强：
- 字号 16px，font-weight 700
- 字间距 0.15em，大写 text-transform
- 底部渐变下划线（从 accent-purple 到 accent-indigo）

#### Scenario: 品牌名带渐变下划线
- **WHEN** 用户查看导航栏品牌名
- **THEN** 「耐心猎人」下方显示紫色到靛蓝的渐变线条

### Requirement: 页面标题元数据更新
系统 SHALL 将 HTML `<title>` 更新为「耐心猎人 — 资产管理」。

#### Scenario: 浏览器标签页标题
- **WHEN** 用户打开页面
- **THEN** 浏览器标签页标题显示「耐心猎人 — 资产管理」
