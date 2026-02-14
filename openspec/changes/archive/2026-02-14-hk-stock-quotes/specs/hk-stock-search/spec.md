## ADDED Requirements

### Requirement: 港股中文搜索
系统 SHALL 支持通过中文名搜索港股，从 `StockNameCN` 表查询预置的港股映射数据。

#### Scenario: 搜索已预置的港股中文名
- **WHEN** 用户搜索 "腾讯"
- **THEN** 返回 `{ ticker: "0700.HK", name: "Tencent Holdings Ltd.", nameCN: "腾讯" }` 等匹配结果

#### Scenario: 搜索未预置的中文名
- **WHEN** 用户用中文搜索但无匹配结果
- **THEN** 返回空数组，前端展示"未找到匹配的股票，请尝试使用英文或 ticker 搜索"

### Requirement: 港股英文搜索
系统 SHALL 支持通过 ticker 或英文名搜索港股，先查本地 DB 再查 Massive。

#### Scenario: 用 ticker 搜索港股
- **WHEN** 用户搜索 "0700.HK" 或 "700"
- **THEN** 从本地 DB 匹配到预置的港股数据并返回

#### Scenario: 英文搜索同时返回美股和港股
- **WHEN** 用户搜索 "Alibaba"
- **THEN** 返回本地 DB 的港股匹配（如 9988.HK）和 Massive API 的美股匹配（如 BABA），合并结果

### Requirement: 港股 seed 数据
系统 SHALL 在 `prisma/seed.ts` 中预置至少 40 只常用港股的 ticker、英文名和中文名。

#### Scenario: seed 数据包含恒指主要成分股
- **WHEN** 执行 `npx prisma db seed`
- **THEN** `StockNameCN` 表中包含腾讯、阿里、美团、小米、比亚迪等常用港股
