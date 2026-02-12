## Context

项目为 Next.js 16 全栈应用（App Router），部署目标为 Zeabur。当前无数据库，所有数据为前端 mock。需要接入 PostgreSQL 进行数据持久化，使用 Prisma 7.x 作为 ORM。

现有架构：
- 前端组件使用 mock 常量数据
- 无 ORM、无数据库连接
- `.env` 中无数据库配置

## Goals / Non-Goals

**Goals:**

- 接入 PostgreSQL，使用 Prisma 7.x ORM
- 设计覆盖核心业务的数据模型（用户、投资组合、持仓、交易、笔记、分析、操作日志）
- 创建 Prisma Client 单例，支持 Next.js 热重载场景
- 提供健康检查 API 验证连通性
- 预留向量数据库关联字段（`qdrant_doc_id`）

**Non-Goals:**

- 不接入向量数据库 Qdrant（后续单独 change）
- 不实现用户认证（后续单独 change）
- 不改造前端组件对接真实数据（后续逐步替换 mock）
- 不实现数据校验和错误处理策略

## Decisions

### 1. ORM 选择：Prisma 7.x

**选择**：Prisma 7.x + `prisma-client` generator

**备选**：
- (A) Drizzle ORM — 更轻量，但文档和生态不如 Prisma 成熟
- (B) 手写 SQL + pg — 灵活但缺少类型安全

**理由**：Prisma 自动生成类型安全的 Client，schema 声明式管理，迁移工具成熟，适合学习项目快速迭代。

### 2. 数据库驱动：@prisma/adapter-pg

**选择**：使用 `@prisma/adapter-pg` + `pg.Pool` 适配器连接 PostgreSQL。

**理由**：Prisma 7.x 的 `prisma-client` generator 要求必须使用 driver adapter（不再内置驱动），`@prisma/adapter-pg` 是官方推荐的 PostgreSQL 适配方案。

### 3. Client 单例模式

**选择**：通过 `globalThis` 缓存 Prisma Client 实例，避免 Next.js dev 热重载时创建过多数据库连接。

**理由**：Next.js 开发模式下模块会被反复重新加载，不缓存会导致连接池耗尽。

### 4. 数据模型设计

**选择**：7 个 model，使用 `@@map` 映射到 snake_case 表名，字段使用 `@map` 映射。

| Model | 表名 | 用途 |
|-------|------|------|
| User | users | 用户信息 |
| Portfolio | portfolios | 投资组合（按风险偏好分仓） |
| Position | positions | 持仓记录 |
| Trade | trades | 交易记录 |
| Note | notes | 用户笔记（预留 qdrant_doc_id） |
| Analysis | analyses | 股票分析（JSONB，预留 qdrant_doc_id） |
| OperationLog | operation_logs | 操作日志（带复合索引） |

**理由**：覆盖资产管理平台核心业务，JSONB 字段保留灵活性，预留向量库关联字段。

### 5. 脚本命名

**选择**：`db:generate`、`db:migrate`、`db:push`、`db:studio`，`build` 前自动 `prisma generate`。

**理由**：统一 `db:` 前缀便于识别，build 前生成确保部署时 Client 代码存在。

## Risks / Trade-offs

- **[风险] Prisma 7.x 较新**：文档和社区经验相对较少。缓解：核心 API 稳定，driver adapter 模式是官方推荐方向。
- **[风险] generated 目录在 .gitignore 中**：部署时需要 `prisma generate` 步骤。缓解：`build` 脚本已自动执行。
- **[权衡] 未实现认证即建 User 表**：User 表目前无密码/token 字段。后续接入认证时需迁移。
- **[权衡] JSONB 字段缺少 schema 校验**：Analysis.content 和 OperationLog.detail 使用 Json 类型，运行时无类型保障。后续可用 Zod 校验。
