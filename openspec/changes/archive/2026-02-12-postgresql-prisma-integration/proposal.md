## Why

项目当前所有数据均为前端 mock，无持久化存储。作为资产管理平台，需要接入关系型数据库保存用户、持仓、交易、笔记、分析等核心业务数据。选择 PostgreSQL 作为关系库，Prisma 7.x 作为 ORM，为后续部署到 Zeabur 做准备。

## What Changes

- 安装 Prisma 7.x（`prisma`、`@prisma/client`）及 PostgreSQL 驱动适配器（`@prisma/adapter-pg`、`pg`）
- 初始化 Prisma 配置：`prisma/schema.prisma`（数据模型）+ `prisma.config.ts`（数据源配置）
- 设计 6 张核心业务表：User、Portfolio、Position、Trade、Note、Analysis、OperationLog
- 创建 Prisma Client 单例（`lib/prisma.ts`），使用 `pg.Pool` + `PrismaPg` 适配器连接 PostgreSQL
- 新增健康检查 API（`GET /api/health`）验证数据库连通性
- 在 `package.json` 中添加数据库相关脚本（generate、migrate、push、studio）

## Capabilities

### New Capabilities

- `database-connection`: PostgreSQL 数据库连接能力，通过 Prisma ORM + pg driver adapter 实现
- `health-check-api`: 数据库健康检查接口 `GET /api/health`

### Modified Capabilities

无

## Impact

- **新文件**: `prisma/schema.prisma` — 数据模型定义（User、Portfolio、Position、Trade、Note、Analysis、OperationLog）
- **新文件**: `prisma.config.ts` — Prisma 数据源配置，从 `.env` 读取 `DATABASE_URL`
- **新文件**: `lib/prisma.ts` — Prisma Client 单例，使用 pg Pool + PrismaPg 适配器
- **新文件**: `app/api/health/route.ts` — 数据库连通性健康检查接口
- **修改**: `package.json` — 新增 `db:generate`、`db:migrate`、`db:push`、`db:studio` 脚本，build 前自动 `prisma generate`
- **依赖**: `prisma`、`@prisma/client`、`@prisma/adapter-pg`、`pg`、`dotenv`、`@types/pg`
