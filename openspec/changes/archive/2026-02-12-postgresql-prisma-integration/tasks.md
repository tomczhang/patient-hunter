## 1. 安装依赖与初始化

- [x] 1.1 安装 `prisma`、`@prisma/client` 依赖
- [x] 1.2 执行 `prisma init --datasource-provider postgresql` 初始化 Prisma 配置
- [x] 1.3 安装 `dotenv` 依赖（prisma.config.ts 需要）
- [x] 1.4 安装 `@prisma/adapter-pg`、`pg`、`@types/pg`（Prisma 7.x driver adapter）

## 2. 数据模型设计

- [x] 2.1 在 `prisma/schema.prisma` 中定义 User model（email unique、name、avatarUrl、时间戳）
- [x] 2.2 定义 Portfolio model（关联 User、riskCategory、name）
- [x] 2.3 定义 Position model（关联 Portfolio、ticker、quantity、costPrice、currency）
- [x] 2.4 定义 Trade model（关联 Portfolio、ticker、action buy/sell、price、tradedAt）
- [x] 2.5 定义 Note model（关联 User、title、content、预留 qdrantDocId）
- [x] 2.6 定义 Analysis model（关联 User、ticker、JSONB content、source、预留 qdrantDocId）
- [x] 2.7 定义 OperationLog model（关联 User、action、JSONB detail、复合索引 userId+createdAt）
- [x] 2.8 所有 model 使用 `@@map` 映射 snake_case 表名，字段使用 `@map` 映射

## 3. Prisma Client 配置

- [x] 3.1 创建 `lib/prisma.ts`，使用 `pg.Pool` + `PrismaPg` 适配器初始化 Prisma Client
- [x] 3.2 实现 `globalThis` 单例缓存，防止 dev 热重载创建过多连接
- [x] 3.3 执行 `prisma generate` 生成 Client 代码，确认无编译错误

## 4. 健康检查 API

- [x] 4.1 创建 `app/api/health/route.ts`，实现 `GET /api/health`
- [x] 4.2 通过 `prisma.$queryRaw` 执行 `SELECT 1` 验证连通性
- [x] 4.3 返回 `{ status: "ok", db: "connected" }` 或错误信息

## 5. 脚本配置

- [x] 5.1 在 `package.json` 中添加 `db:generate`、`db:migrate`、`db:push`、`db:studio` 脚本
- [x] 5.2 修改 `build` 脚本为 `prisma generate && next build`，确保部署时生成 Client

## 6. 验证

- [x] 6.1 确认 `prisma generate` 成功生成 Client 代码到 `lib/generated/prisma/`
- [x] 6.2 确认 `lib/prisma.ts` 和 `app/api/health/route.ts` 无 linter 错误
- [x] 6.3 确认 `.gitignore` 已包含 `/lib/generated/prisma` 和 `.env*`
