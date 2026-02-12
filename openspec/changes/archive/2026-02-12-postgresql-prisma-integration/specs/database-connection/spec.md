## ADDED Requirements

### Requirement: PostgreSQL 数据库连接
项目 SHALL 通过 Prisma 7.x ORM + `@prisma/adapter-pg` 连接 PostgreSQL 数据库，连接串从环境变量 `DATABASE_URL` 读取。

#### Scenario: Prisma Client 初始化
- **WHEN** 服务端代码首次引用 `lib/prisma.ts` 导出的 `prisma` 实例
- **THEN** SHALL 使用 `pg.Pool` 创建连接池，通过 `PrismaPg` 适配器初始化 Prisma Client

#### Scenario: 开发模式单例
- **WHEN** Next.js dev 模式热重载模块
- **THEN** Prisma Client SHALL 通过 `globalThis` 缓存复用，不重复创建连接

### Requirement: 数据模型
`prisma/schema.prisma` SHALL 定义以下 7 个 model，所有表名使用 snake_case 映射。

#### Scenario: Schema 定义完整
- **WHEN** 执行 `prisma generate`
- **THEN** SHALL 成功生成包含 User、Portfolio、Position、Trade、Note、Analysis、OperationLog 7 个 model 的 Prisma Client

### Requirement: 健康检查接口
`GET /api/health` SHALL 返回数据库连通状态。

#### Scenario: 数据库连接正常
- **WHEN** 客户端请求 `GET /api/health` 且数据库可达
- **THEN** SHALL 返回 `{ "status": "ok", "db": "connected" }`，HTTP 200

#### Scenario: 数据库连接异常
- **WHEN** 客户端请求 `GET /api/health` 且数据库不可达
- **THEN** SHALL 返回 `{ "status": "error", "db": "<错误信息>" }`，HTTP 500

### Requirement: 构建脚本
`package.json` SHALL 包含数据库相关脚本。

#### Scenario: 构建时自动生成 Client
- **WHEN** 执行 `pnpm build`
- **THEN** SHALL 先执行 `prisma generate` 生成 Client 代码，再执行 `next build`
