# 数据库 Schema 扩展设计

## 概述

本次扩展在原有 schema 基础上新增了 8 个核心表，支持以下功能：
1. 仓位快照（每日/每周/每月自动生成）
2. 关注的股票（带价格提醒）
3. 规则系统（预设规则模板 + 用户规则实例 + 执行历史）
4. 金融教练（内容源 + 文档）
5. 日历事件（支持重复和工作日）
6. 通知系统（统一的通知表）

## 新增表结构

### 1. PortfolioSnapshot（仓位快照）

**用途**：每天 0:00 自动生成前一天的仓位快照，支持全仓和单个组合快照。

**关键字段**：
- `portfolioId`: null 表示全仓快照，非 null 表示单个组合快照
- `snapshotDate`: 快照日期（前一天的日期）
- `snapshotType`: daily | weekly | monthly
- `totalValue`: JSON，按币种拆分 + 统一换算为主货币
  ```json
  {
    "USD": 10000,
    "HKD": 50000,
    "CNY": 300000,
    "totalInPrimaryCurrency": 15000
  }
  ```
- `positions`: JSON，完整的 Position 信息 + 快照时的市值
  ```json
  [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "quantity": 100,
      "costPrice": 150,
      "currency": "USD",
      "currentPrice": 180,
      "marketValue": 18000,
      "pnl": 3000
    }
  ]
  ```
- `exchangeRates`: JSON，快照时的汇率
  ```json
  {
    "USD": 1.0,
    "HKD": 7.8,
    "CNY": 7.2
  }
  ```

**数据保留策略**：
- 日快照：保留 365 天
- 周快照：保留 5 年
- 月快照：永久保留

**索引**：
- `[userId, snapshotDate]` - 查询用户某天的快照
- `[userId, snapshotType, snapshotDate]` - 查询特定类型的快照
- `[portfolioId, snapshotDate]` - 查询单个组合的快照

### 2. WatchedStock（关注的股票）

**用途**：用户关注的股票，支持价格提醒。

**关键字段**：
- `alerts`: JSON，价格提醒配置
  ```json
  [
    {
      "type": "price",
      "value": 200,
      "direction": "above" // above | below
    },
    {
      "type": "change",
      "percent": 5,
      "direction": "up" // up | down
    },
    {
      "type": "discipline",
      "ruleId": "user_rule_123"
    }
  ]
  ```

**索引**：
- `[userId, ticker]` - 唯一约束，一个用户不能重复关注同一只股票
- `[userId]` - 查询用户所有关注的股票

### 3. RuleTemplate（规则模板）

**用途**：全局预设规则模板，平台提供的规则类型。

**关键字段**：
- `ruleId`: 全局唯一规则ID，如 "position_cash_ratio", "pyramid_add"
- `version`: 规则版本号，如 "1.0.0"
- `parameterSchema`: JSON Schema，定义该规则需要的参数结构
  ```json
  {
    "type": "object",
    "properties": {
      "targetRatio": { "type": "number", "minimum": 0, "maximum": 1 },
      "tolerance": { "type": "number", "minimum": 0, "maximum": 0.1 }
    },
    "required": ["targetRatio"]
  }
  ```

**规则类型示例**：
- `position_cash_ratio`: 仓位现金比规则
- `pyramid_add`: 金字塔梯度加仓规则
- `stop_loss`: 止损规则
- `take_profit`: 止盈规则
- `rebalance`: 再平衡规则
- `entry`: 建仓规则

### 4. UserRule（用户规则实例）

**用途**：用户创建的规则实例，关联到规则模板。

**关键字段**：
- `type`: stock | portfolio | global
  - `stock`: 针对单只股票
  - `portfolio`: 针对某个组合
  - `global`: 全局规则
- `targetId`: 根据 type 决定
  - `stock`: ticker（如 "AAPL"）
  - `portfolio`: portfolioId（字符串形式）
  - `global`: null
- `parameters`: JSON，用户配置的参数
  ```json
  {
    "targetRatio": 0.7,
    "tolerance": 0.05
  }
  ```

**索引**：
- `[userId, type, targetId]` - 查询用户特定类型的规则

### 5. DisciplineExecution（规则执行历史）

**用途**：记录规则执行情况。

**关键字段**：
- `status`: completed | partial | failed
- `reason`: 部分执行或未执行的原因（可选）

**注意**：历史执行记录始终关联到 `userRuleId`，即使规则模板版本更新，执行记录仍关联用户规则实例。

### 6. ContentSource（内容源）

**用途**：用户添加的金融教练（公众号、文档、RSS等）。

**关键字段**：
- `type`: wechat_public | document | rss | manual
- `config`: JSON，配置信息
  ```json
  {
    "wechatId": "xxx",
    "syncInterval": "daily"
  }
  ```

### 7. ContentItem（内容项）

**用途**：从内容源同步的文章/文档。

**关键字段**：
- `content`: 提取的文本内容（PDF/Word/TXT 解析后的纯文本）
- 不存储原始文件，只存储提取的文本

### 8. CalendarEvent（日历事件）

**用途**：用户的日历事件，支持重复。

**关键字段**：
- `eventType`: trade_reminder | rebalance | review | custom
- `repeatRule`: JSON，重复规则
  ```json
  {
    "frequency": "daily", // daily | weekly | monthly
    "interval": 1, // 每 N 天/周/月
    "endDate": "2026-12-31", // 可选，重复结束日期
    "daysOfWeek": [1, 3, 5], // 每周的哪些天（仅 weekly）
    "dayOfMonth": 15, // 每月的第几天（仅 monthly）
    "workdaysOnly": true // 仅工作日（周一到周五）
  }
  ```

### 9. Notification（通知）

**用途**：统一的通知表，记录所有通知。

**关键字段**：
- `type`: price_alert | discipline_triggered | snapshot_failed | system
- `channels`: JSON，已发送的渠道
  ```json
  ["in_app", "email", "sms", "phone"]
  ```
- `sentAt`: 发送时间（用于判断是否已发送）

**注意**：不需要"已读"状态，只需要"已发送"状态。

## 用户表扩展

### User 表新增字段

- `phone`: 带国家代码的手机号，唯一
- `primaryCurrency`: 主货币（USD | CNY | HKD），根据手机号国家自动判断
  - 中国（+86）→ CNY
  - 香港（+852）→ HKD
  - 其他 → USD

## 数据关系图

```
User
├── Portfolio
│   ├── Position
│   ├── Trade
│   └── PortfolioSnapshot
├── WatchedStock
├── UserRule
│   └── DisciplineExecution
├── ContentSource
│   └── ContentItem
├── CalendarEvent
└── Notification

RuleTemplate
└── UserRule
```

## 索引策略

### 查询优化索引

1. **PortfolioSnapshot**
   - `[userId, snapshotDate]` - 查询用户某天的快照
   - `[userId, snapshotType, snapshotDate]` - 查询特定类型快照
   - `[portfolioId, snapshotDate]` - 查询单个组合快照

2. **WatchedStock**
   - `[userId, ticker]` - 唯一约束
   - `[userId]` - 查询用户所有关注股票

3. **UserRule**
   - `[userId, type, targetId]` - 查询用户特定类型规则

4. **DisciplineExecution**
   - `[userRuleId, executedAt]` - 查询规则执行历史

5. **ContentItem**
   - `[sourceId, publishedAt]` - 查询内容源的文章

6. **CalendarEvent**
   - `[userId, scheduledAt]` - 查询用户日历事件
   - `[userId, eventType]` - 按类型查询

7. **Notification**
   - `[userId, sentAt]` - 查询用户通知
   - `[userId, type]` - 按类型查询

## 定时任务

### 快照生成任务

**触发时机**：每天 0:00（UTC）

**执行逻辑**：
1. 生成前一天的快照（snapshotDate = 昨天）
2. 对所有用户执行：
   - 生成全仓快照（portfolioId = null）
   - 对每个 Portfolio 生成组合快照
3. 获取快照时的汇率（从汇率 API）
4. 计算总资产（按币种拆分 + 统一换算）
5. 如果失败，发送通知给管理员（固定用户ID）

**Zeabur 部署**：
- 使用 Zeabur 的 Cron Jobs 功能
- 或使用外部服务（如 GitHub Actions、Cloudflare Workers）

## 数据迁移注意事项

1. **现有用户**：需要添加 `phone` 和 `primaryCurrency` 字段
2. **现有 Portfolio**：可以开始生成快照
3. **现有 Trade**：不影响，继续使用

## 后续优化建议

1. **快照清理任务**：定期清理过期快照（按保留策略）
2. **提醒检查任务**：定期检查价格提醒条件
3. **规则执行任务**：手动触发规则执行（用户操作）
4. **内容同步任务**：如果未来支持自动同步，需要后台任务
