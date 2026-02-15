## ADDED Requirements

### Requirement: 文本解析 API
系统 SHALL 提供 `POST /api/ai/parse-text` 接口，将用户自然语言描述的交易或持仓信息解析为结构化数据。

#### Scenario: 解析单笔交易描述
- **WHEN** 请求 body 为 `{ "text": "昨天买了100股腾讯，成交价380港币" }`
- **THEN** SHALL 返回 `{ "type": "trade_record", "data": { "trades": [{ "ticker": "0700.HK", "name": "腾讯", "action": "buy", "quantity": 100, "price": 380, "currency": "HKD" }] } }`

#### Scenario: 解析多笔交易描述
- **WHEN** 请求 body 为 `{ "text": "买了AAPL 50股@150，同时卖了TSLA 20股@200" }`
- **THEN** SHALL 返回包含 2 个 trade item 的 trades 数组

#### Scenario: 解析持仓描述
- **WHEN** 请求 body 为 `{ "text": "我目前持有苹果500股成本120，腾讯200股成本350" }`
- **THEN** SHALL 返回 `{ "type": "position", "data": { "positions": [...] } }`

#### Scenario: 无法解析的文本
- **WHEN** 请求 body 中的文本与交易或持仓无关
- **THEN** SHALL 返回 `{ "type": "unknown", "data": null, "rawText": "<原始文本>" }`

#### Scenario: 缺少 text 参数
- **WHEN** 请求 body 为空或缺少 `text` 字段
- **THEN** SHALL 返回 400 状态码和 `{ "error": "缺少 text 参数" }`

### Requirement: 文本解析输出格式与图片解析一致
`/api/ai/parse-text` 的返回格式 SHALL 与 `/api/ai/parse`（图片解析）保持一致，共用 `ImageParseOutput` 类型结构。

#### Scenario: 返回结构对齐
- **WHEN** 文本解析成功
- **THEN** 返回 SHALL 包含 `type`（trade_record / position / unknown）、`confidence`、`reason`、`data`、`rawText` 字段，与图片解析输出类型相同

### Requirement: 图片解析 API 支持附带文字上下文
`/api/ai/parse` SHALL 支持可选的 `context` 字段，将用户输入的文字作为额外上下文传递给 Vision 模型。

#### Scenario: 纯图片请求（向后兼容）
- **WHEN** 请求 body 为 `{ "imageBase64": "..." }`（无 context 字段）
- **THEN** SHALL 与当前行为一致，正常解析图片

#### Scenario: 图片+文字上下文
- **WHEN** 请求 body 为 `{ "imageBase64": "...", "context": "这是我富途的港股持仓截图" }`
- **THEN** SHALL 将 context 文字附加到 Vision prompt 中，辅助图片分类和数据提取
