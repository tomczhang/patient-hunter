## ADDED Requirements

### Requirement: AssetPanel 摘要区域中文化
AssetPanel 摘要卡片中的所有英文文案 SHALL 翻译为中文。

#### Scenario: 摘要卡片标签
- **WHEN** 资产面板加载
- **THEN** 摘要卡片标签 SHALL 显示"总净资产"（替代 "Total Net Worth"），趋势文案 SHALL 显示"今年 +12.4%"（替代 "+12.4% this year"）

#### Scenario: 柱状图标签
- **WHEN** 资产面板加载
- **THEN** 柱状图区域标签 SHALL 显示"投资组合表现"（替代 "Portfolio Performance"）

### Requirement: AssetPanel 表格区域中文化
资产配置表格的所有英文表头和按钮 SHALL 翻译为中文。

#### Scenario: 表格标题和按钮
- **WHEN** 资产面板加载
- **THEN** 表格标题 SHALL 显示"资产配置"（替代 "Asset Allocation"），按钮 SHALL 显示"+ 添加资产"（替代 "+ Add Asset"）

#### Scenario: 表格列头
- **WHEN** 资产面板加载
- **THEN** 表格列头 SHALL 分别显示"资产名称"、"类别"、"分配比例"、"当前价值"、"表现"（替代 "Asset Name"、"Category"、"Allocation"、"Current Value"、"Performance"）

### Requirement: 添加资产表单中文化
AddAssetForm 组件内所有用户可见文案 SHALL 使用中文。

#### Scenario: 表单标题和描述
- **WHEN** 添加资产表单加载
- **THEN** 标题 SHALL 显示"新增资产"，副标题 SHALL 显示相应中文描述

#### Scenario: 资产类型标签
- **WHEN** 添加资产表单加载
- **THEN** 四种资产类型 SHALL 分别显示"股票"、"ETF/基金"、"加密货币"、"房产"

#### Scenario: 表单字段标签
- **WHEN** 添加资产表单加载
- **THEN** 所有字段 label SHALL 使用中文：代码搜索、分类、币种、购入日期、数量、每股价格、总成本

#### Scenario: 操作按钮
- **WHEN** 添加资产表单加载
- **THEN** 按钮 SHALL 分别显示"放弃草稿"和"添加到组合"
