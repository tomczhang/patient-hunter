-- AlterTable: 扩展 users 表
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "primary_currency" TEXT NOT NULL DEFAULT 'USD';

-- CreateIndex: phone 唯一索引
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateTable: 仓位快照
CREATE TABLE "portfolio_snapshots" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "portfolio_id" INTEGER,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "snapshot_type" TEXT NOT NULL,
    "total_value" JSONB NOT NULL,
    "positions" JSONB NOT NULL,
    "exchange_rates" JSONB NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable: 关注的股票
CREATE TABLE "watched_stocks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "alerts" JSONB,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watched_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable: 规则模板
CREATE TABLE "rule_templates" (
    "id" SERIAL NOT NULL,
    "rule_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "parameter_schema" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rule_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: 用户规则实例
CREATE TABLE "user_rules" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rule_template_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "target_id" TEXT,
    "parameters" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable: 规则执行历史
CREATE TABLE "discipline_executions" (
    "id" SERIAL NOT NULL,
    "user_rule_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discipline_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: 内容源
CREATE TABLE "content_sources" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "config" JSONB,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable: 内容项
CREATE TABLE "content_items" (
    "id" SERIAL NOT NULL,
    "source_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "qdrant_doc_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: 日历事件
CREATE TABLE "calendar_events" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "related_id" TEXT,
    "repeat_rule" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: 通知
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "channels" JSONB NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rule_templates_rule_id_key" ON "rule_templates"("rule_id");
CREATE UNIQUE INDEX "watched_stocks_user_id_ticker_key" ON "watched_stocks"("user_id", "ticker");

-- CreateIndex: 查询优化索引
CREATE INDEX "portfolio_snapshots_user_id_snapshot_date_idx" ON "portfolio_snapshots"("user_id", "snapshot_date");
CREATE INDEX "portfolio_snapshots_user_id_snapshot_type_snapshot_date_idx" ON "portfolio_snapshots"("user_id", "snapshot_type", "snapshot_date");
CREATE INDEX "portfolio_snapshots_portfolio_id_snapshot_date_idx" ON "portfolio_snapshots"("portfolio_id", "snapshot_date");
CREATE INDEX "watched_stocks_user_id_idx" ON "watched_stocks"("user_id");
CREATE INDEX "user_rules_user_id_type_target_id_idx" ON "user_rules"("user_id", "type", "target_id");
CREATE INDEX "discipline_executions_user_rule_id_executed_at_idx" ON "discipline_executions"("user_rule_id", "executed_at");
CREATE INDEX "content_sources_user_id_idx" ON "content_sources"("user_id");
CREATE INDEX "content_items_source_id_published_at_idx" ON "content_items"("source_id", "published_at");
CREATE INDEX "calendar_events_user_id_scheduled_at_idx" ON "calendar_events"("user_id", "scheduled_at");
CREATE INDEX "calendar_events_user_id_event_type_idx" ON "calendar_events"("user_id", "event_type");
CREATE INDEX "notifications_user_id_sent_at_idx" ON "notifications"("user_id", "sent_at");
CREATE INDEX "notifications_user_id_type_idx" ON "notifications"("user_id", "type");

-- AddForeignKey
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "watched_stocks" ADD CONSTRAINT "watched_stocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_rules" ADD CONSTRAINT "user_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_rules" ADD CONSTRAINT "user_rules_rule_template_id_fkey" FOREIGN KEY ("rule_template_id") REFERENCES "rule_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "discipline_executions" ADD CONSTRAINT "discipline_executions_user_rule_id_fkey" FOREIGN KEY ("user_rule_id") REFERENCES "user_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "content_sources" ADD CONSTRAINT "content_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "content_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;