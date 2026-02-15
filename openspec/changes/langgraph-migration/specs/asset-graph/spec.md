## ADDED Requirements

### Requirement: LangGraph 有向图定义
系统 SHALL 使用 `@langchain/langgraph` 的 `StateGraph` 构建名为 `AssetGraph` 的有向图，统一管理资产解析的完整生命周期（输入 → 分类 → 提取 → 补全 → 校验 → 用户确认 → 入库）。

#### Scenario: Graph 编译成功
- **WHEN** 调用 `graph.compile({ checkpointer })` 时
- **THEN** SHALL 返回一个可执行的 `CompiledStateGraph` 实例，无报错

#### Scenario: Graph 包含全部 Node
- **WHEN** 查看 Graph 定义
- **THEN** SHALL 包含以下 10 个 Node：`ingest`、`img_classify`、`text_classify`、`ext_op`、`ext_hold`、`enrich`、`check_missing`、`present_review`、`store_db`

### Requirement: Graph State 类型定义
系统 SHALL 定义 `AssetGraphState`，使用 LangGraph 的 `Annotation.Root` 声明所有状态字段。

#### Scenario: State 包含输入字段
- **WHEN** 查看 State 定义
- **THEN** SHALL 包含 `inputType`（"image" | "text"）、`imageData`（string | undefined）、`textInput`（string | undefined）

#### Scenario: State 包含分类与提取字段
- **WHEN** 查看 State 定义
- **THEN** SHALL 包含 `task`（TaskType）、`extractedData`（OperationItem[] | HoldingItem[] | null）

#### Scenario: State 包含确认与入库字段
- **WHEN** 查看 State 定义
- **THEN** SHALL 包含 `reviewPayload`（ReviewPayload | null）、`confirmedData`（含 rows, riskCategory, portfolioId）、`storeResult`（含 success, ids）

### Requirement: ingest 节点规范化输入
`ingest` 节点 SHALL 根据输入参数判断 `inputType` 并填入 State。

#### Scenario: 有图片输入
- **WHEN** 输入包含 `imageData`（非空 base64 字符串）
- **THEN** SHALL 设置 `inputType = "image"`

#### Scenario: 仅文本输入
- **WHEN** 输入不包含 `imageData`，仅包含 `textInput`
- **THEN** SHALL 设置 `inputType = "text"`

### Requirement: img_classify 节点图片分类
`img_classify` 节点 SHALL 使用 Vision 模型对图片进行分类，输出 `task` 字段。

#### Scenario: 识别为交易记录
- **WHEN** Vision 模型判断图片为交易记录截图
- **THEN** SHALL 设置 `task = "operation"`

#### Scenario: 识别为持仓截图
- **WHEN** Vision 模型判断图片为持仓截图
- **THEN** SHALL 设置 `task = "holding"`

#### Scenario: 无法识别且有文字输入
- **WHEN** Vision 模型判断图片为 unknown 且 State 中 `textInput` 存在
- **THEN** SHALL 回退到文本分类逻辑（等同 `text_classify` 行为），并在 warnings 中记录"图片无效，已按文字内容处理"

#### Scenario: 无法识别且无文字输入
- **WHEN** Vision 模型判断图片为 unknown 且 State 中 `textInput` 不存在
- **THEN** SHALL 设置 `task = "unknown"`

### Requirement: text_classify 节点文本分类
`text_classify` 节点 SHALL 使用 Chat 模型判断用户文本描述的意图类型。

#### Scenario: 文本包含交易关键词
- **WHEN** 用户文本包含"买""卖""成交"等交易关键词
- **THEN** SHALL 设置 `task = "operation"`

#### Scenario: 文本包含持仓关键词
- **WHEN** 用户文本包含"持有""持仓""成本"等持仓关键词
- **THEN** SHALL 设置 `task = "holding"`

#### Scenario: 文本无法分类
- **WHEN** 用户文本与交易或持仓无关
- **THEN** SHALL 设置 `task = "unknown"`

### Requirement: ext_op 节点提取交易记录
`ext_op` 节点 SHALL 根据 `inputType` 选择 Vision 或 Chat 模型提取结构化交易数据。

#### Scenario: 图片输入提取
- **WHEN** `inputType = "image"` 且 `task = "operation"`
- **THEN** SHALL 使用 Vision 模型 + `withStructuredOutput(OperationParseSchema)` 从图片提取 `OperationItem[]`

#### Scenario: 文本输入提取
- **WHEN** `inputType = "text"` 且 `task = "operation"`
- **THEN** SHALL 使用 Chat 模型 + `withStructuredOutput(OperationParseSchema)` 从文本提取 `OperationItem[]`

#### Scenario: 提取结果不含 currency
- **WHEN** 提取完成
- **THEN** `OperationItem` 中的 `currency` 字段 SHALL 留空（由 enrich 节点补全）

### Requirement: ext_hold 节点提取持仓信息
`ext_hold` 节点 SHALL 根据 `inputType` 选择 Vision 或 Chat 模型提取结构化持仓数据。

#### Scenario: 图片输入提取
- **WHEN** `inputType = "image"` 且 `task = "holding"`
- **THEN** SHALL 使用 Vision 模型 + `withStructuredOutput(HoldingParseSchema)` 从图片提取 `HoldingItem[]`

#### Scenario: 文本输入提取
- **WHEN** `inputType = "text"` 且 `task = "holding"`
- **THEN** SHALL 使用 Chat 模型 + `withStructuredOutput(HoldingParseSchema)` 从文本提取 `HoldingItem[]`

### Requirement: enrich 节点统一补全 ticker 和 currency
`enrich` 节点 SHALL 遍历 `extractedData` 中每个 item，查找正确 ticker 并推断 currency。

#### Scenario: DB 查到匹配
- **WHEN** `searchStocks(name)` 返回结果
- **THEN** SHALL 用匹配结果的 ticker 和 currency 替换原值

#### Scenario: AI fallback 查到匹配
- **WHEN** `searchStocks` 无结果但 `aiSearchFallback(name)` 返回结果
- **THEN** SHALL 使用轻量 LLM 模型执行 AI fallback，用匹配结果替换原值

#### Scenario: 均未查到
- **WHEN** DB 和 AI fallback 均无结果
- **THEN** SHALL 将 ticker 设为 "UNKNOWN"，继续流转

#### Scenario: currency 自动推断
- **WHEN** ticker 确定后
- **THEN** SHALL 根据 ticker 后缀推断 currency（.HK→HKD, .SS/.SZ→CNY, 其他→USD）

### Requirement: check_missing 节点校验必填字段
`check_missing` 节点 SHALL 检查 `extractedData` 中每行的必填字段。

#### Scenario: operation 必填字段
- **WHEN** `task = "operation"`
- **THEN** SHALL 检查每行的 ticker、quantity、price 是否非空

#### Scenario: holding 必填字段
- **WHEN** `task = "holding"`
- **THEN** SHALL 检查每行的 ticker、quantity、costPrice 是否非空

#### Scenario: tradedAt 默认值
- **WHEN** `task = "operation"` 且某行 `tradedAt` 为空
- **THEN** SHALL 自动填充当天日期（YYYY-MM-DD 格式）

#### Scenario: UNKNOWN ticker 记入 warnings
- **WHEN** 某行 ticker 为 "UNKNOWN"
- **THEN** SHALL 在 warnings 中追加该行信息

### Requirement: present_review 节点组装 payload 并 interrupt
`present_review` 节点 SHALL 组装 `reviewPayload` 后触发 LangGraph interrupt。

#### Scenario: 正常 interrupt
- **WHEN** extractedData 和 missingFields 已就绪
- **THEN** SHALL 组装 ReviewPayload（type, rows, missingFields, warnings）并抛出 `NodeInterrupt`

#### Scenario: unknown 类型
- **WHEN** `task = "unknown"`
- **THEN** reviewPayload.rows SHALL 为空数组，前端允许用户手动添加行

### Requirement: Conditional Edge 路由
Graph SHALL 定义两个条件边用于路由。

#### Scenario: 按 inputType 路由
- **WHEN** `ingest` 执行完毕
- **THEN** SHALL 根据 `inputType` 路由到 `img_classify`（image）或 `text_classify`（text）

#### Scenario: 按 task 路由
- **WHEN** `img_classify` 或 `text_classify` 执行完毕
- **THEN** SHALL 根据 `task` 路由到 `ext_op`（operation）、`ext_hold`（holding）或 `present_review`（unknown）

### Requirement: Checkpointer 配置
Graph SHALL 支持 checkpointer 注入，用于 interrupt/resume 的状态持久化。

#### Scenario: 开发环境
- **WHEN** 开发模式
- **THEN** SHALL 使用 `MemorySaver` 作为 checkpointer

#### Scenario: 生产环境
- **WHEN** 生产模式
- **THEN** SHALL 使用 `PostgresSaver` 复用现有 PostgreSQL 数据库

#### Scenario: thread 过期
- **WHEN** interrupt 后 30 分钟内未 resume
- **THEN** thread 状态 SHALL 被视为过期
