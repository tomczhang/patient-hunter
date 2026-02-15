## MODIFIED Requirements

### Requirement: 文本解析 API
系统 SHALL 通过 AssetGraph 的 `text_classify` + `ext_op`/`ext_hold` 节点完成文本解析，不再提供独立的 `/api/ai/parse-text` 端点。

#### Scenario: 解析单笔交易描述
- **WHEN** 用户输入 "昨天买了100股腾讯，成交价380港币"
- **THEN** SHALL 经 text_classify 分类为 operation，再由 ext_op 提取为 OperationItem[]，ticker/currency 由 enrich 补全

#### Scenario: 解析多笔交易描述
- **WHEN** 用户输入 "买了AAPL 50股@150，同时卖了TSLA 20股@200"
- **THEN** SHALL 提取为包含 2 条 OperationItem 的数组

#### Scenario: 解析持仓描述
- **WHEN** 用户输入 "我目前持有苹果500股成本120，腾讯200股成本350"
- **THEN** SHALL 经 text_classify 分类为 holding，再由 ext_hold 提取为 HoldingItem[]

#### Scenario: 无法解析的文本
- **WHEN** 用户文本与交易或持仓无关
- **THEN** SHALL 经 text_classify 分类为 unknown，跳转 present_review 返回空 rows

#### Scenario: 缺少 text 参数
- **WHEN** invoke 请求 body 中 imageData 和 textInput 均为空
- **THEN** SHALL 由 invoke 端点返回 400 状态码

### Requirement: 文本分类与提取分离
文本路径 SHALL 拆分为两步：先由 `text_classify` 判断 task 类型，再由 `ext_op` 或 `ext_hold` 提取结构化数据。

#### Scenario: 分类步骤
- **WHEN** text_classify 执行
- **THEN** SHALL 仅输出 task（operation / holding / unknown），不做数据提取

#### Scenario: 提取步骤
- **WHEN** ext_op 或 ext_hold 对文本执行提取
- **THEN** SHALL 使用 Chat 模型 + withStructuredOutput 输出结构化数据，不输出 currency（由 enrich 补全）

### Requirement: 文本解析不使用 tool calling
文本路径的分类和提取节点 SHALL 均为单次 LLM 调用，不使用 `bindTools` 或 `stock_search` tool。

#### Scenario: 无 tool calling
- **WHEN** text_classify 或 text_extract 执行时
- **THEN** SHALL 不调用任何 LangChain tool，ticker 查找由 enrich 节点统一处理

## REMOVED Requirements

### Requirement: 独立文本解析端点
**Reason**: `/api/ai/parse-text` 端点被统一的 `/api/ai/asset-graph/invoke` 替代
**Migration**: 前端改调 `POST /api/ai/asset-graph/invoke` 并传入 `{ textInput: "..." }`

### Requirement: 文本解析输出格式与图片解析一致
**Reason**: 不再使用 `ImageParseOutput` 类型，统一为 Graph State 中的 `ReviewPayload`
**Migration**: 前端使用 invoke 返回的 `reviewPayload` 替代原 `ImageParseOutput`
