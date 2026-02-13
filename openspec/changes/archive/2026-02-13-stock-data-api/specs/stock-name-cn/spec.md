## ADDED Requirements

### Requirement: 中文名称映射存储
系统 SHALL 使用 PostgreSQL 表 `StockNameCN` 存储美股 ticker 与中文公司名称的映射关系。

#### Scenario: 映射表数据结构
- **WHEN** 系统读取 StockNameCN 表
- **THEN** 每条记录 SHALL 包含 `id`、`ticker`（唯一）、`nameEN`（英文名）、`nameCN`（中文名）、`source`（来源: manual/llm/seed）、`createdAt`、`updatedAt`

### Requirement: 种子数据预填充
系统 SHALL 提供 seed 脚本，预填充 TOP 100 热门美股的中文名称映射。

#### Scenario: 执行种子脚本
- **WHEN** 运行 `pnpm db:seed`
- **THEN** 系统 SHALL 向 StockNameCN 表插入约 100 条热门美股的 ticker ↔ 中文名映射，source 字段为 "seed"

#### Scenario: 种子数据幂等性
- **WHEN** 种子脚本重复执行
- **THEN** 已存在的记录 SHALL 不被覆盖（使用 upsert，仅在 nameCN 为空时更新）

### Requirement: LLM 自动翻译兜底
系统 SHALL 在首次查询未知 ticker 时，自动调用 LLM 翻译英文公司名为中文，并缓存到 StockNameCN 表。

#### Scenario: 自动翻译并缓存
- **WHEN** 查询 ticker 详情时，本地无该 ticker 的中文名记录
- **THEN** 系统 SHALL 调用 GPT 翻译英文公司名为中文常用名称，并将结果存入 StockNameCN 表（source="llm"）

#### Scenario: LLM 不可用时降级
- **WHEN** LLM 翻译调用失败（网络错误、API 限额等）
- **THEN** 系统 SHALL 降级返回英文公司名，不阻塞主流程

### Requirement: 中文搜索能力
系统 SHALL 支持通过中文关键词搜索本地 StockNameCN 表中的股票。

#### Scenario: 中文模糊搜索
- **WHEN** 搜索关键词包含中文字符
- **THEN** 系统 SHALL 在 StockNameCN 表的 nameCN 字段执行模糊匹配（contains），返回匹配的 ticker 列表
