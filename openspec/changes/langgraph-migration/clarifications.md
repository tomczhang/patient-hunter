# Clarifications

Based on proposal.md, the following ambiguities need resolution before proceeding to specs.

---

## F1: AssetGraph 有向图定义（asset-graph）

- Question: Graph 中 `text_extract` 节点使用单次 LLM 提取（无 tool calling），LLM 输出的 ticker 可能是近似值（如"苹果"而非"AAPL"）。如果 enrich 节点也无法匹配到正确 ticker（DB 和 AI fallback 都失败），该行数据如何处理？是标记为 UNKNOWN 继续流转，还是整行丢弃？
  Answer: 标记为 UNKNOWN 继续流转，后续还有用户自己人工确认补充的机会

- Question: 图片路径中 classify 节点识别为 unknown 后，直接跳到 present_review 告知用户"无法识别"。此时 reviewPayload 中 rows 是否为空数组？用户是否可以在空表格上手动添加行？
  Answer: 可以

- Question: 图片 + 文字混合输入时，textInput 作为 Vision 模型的辅助 context。如果用户上传了一张无关图片但文字描述了有效的交易信息，应该按图片路径（classify → unknown）还是文本路径处理？
  Answer: 按照文本路径处理，并提示图片无效

- Question: enrich 节点的 AI fallback 调用 LLM 查找股票，这与 text_extract 的 LLM 调用是否使用同一个模型（chat model）？还是 enrich 可以使用更轻量的模型？
  Answer: 使用更轻量的模型

## F2: 统一 API 入口（asset-graph-api）

- Question: invoke 端点返回 `{ threadId, reviewPayload }` 后，如果前端网络断开或用户关闭页面，30 分钟过期后 thread 被清理。用户重新打开时是否需要提示"上次解析结果已过期，请重新输入"？
  Answer: 不需要提示，直接初始状态让用户重新填写即可

- Question: resume 端点接收 `confirmedData`，如果 `threadId` 已过期或不存在，应该返回什么 HTTP 状态码和错误信息？
  Answer: 提示上次解析结果已过期，请重新输入

- Question: 当前 `/api/ai/parse` 和 `/api/ai/parse-text` 是否在新 API 稳定后立即删除，还是保留一个过渡期？如果保留，过渡期多久？
  Answer: 立即删除

## F3: 数据入库（store-db）

- Question: `store_db` 需要 `portfolioId`。当前方案是根据 riskCategory findOrCreate Portfolio。如果用户是新用户且没有任何 Portfolio，是否在 store_db 中自动创建？还是需要用户先在 settings 页面创建 Portfolio？
  Answer: 把Portfolio作为用户需要确认的必填项要求用户填写

- Question: 交易记录（Trade）的 `tradedAt` 是必填的 DateTime 字段。如果用户在 AssetConfirmTable 中没有填写日期，store_db 应该用当天日期作为默认值，还是拒绝写入？
  Answer: 用当天时间当默认值

- Question: 批量写入时（多行数据），如果其中一行写入失败（如数据校验不通过），是整批回滚还是跳过失败行继续写入成功的？
  Answer: 整批回滚

- Question: 写入成功后是否需要在前端刷新 AssetPanel 的资产列表？如果是，通过什么机制通知（API 返回后前端 refetch，还是其他方式）？
  Answer: 刷新，前端页面reload即可

## F4: text-parse-api 改造

- Question: 去掉 tool calling 后，text_extract 的 prompt 需要简化。现有 PARSE_TEXT_PROMPT 中有大量关于 stock_search 工具的指令和币种推断规则。新 prompt 是否只需要输出 type + data JSON，将币种推断完全交给 enrich 节点？
  Answer: 是的

- Question: 现有 PARSE_TEXT_PROMPT 要求 LLM 区分 trade_record 和 position（即在一次调用中同时分类 + 提取）。改造后是否保持这个行为（text_extract 同时输出 task + extractedData），还是拆成两步（先分类再提取）？
  Answer: 拆成两步

## F5: 类型命名变更（asset-confirm-table 修改）

- Question: `trade_record → operation`、`position → holding` 的命名变更是否仅限于前端和 Graph State，还是也需要修改 Prisma Schema 中的 model 名称（当前 model 名是 `Trade` 和 `Position`）？
  Answer: 统一修改

- Question: 现有 `lib/ai/image-pipeline/types.ts` 中的 Zod Schema（TradeParseSchema、PositionParseSchema）和类型定义（TradeItemSchema、PositionItemSchema）是否需要重命名？还是保持原名，仅在 Graph State 层做映射？
  Answer: 重新命名

- Question: AssetConfirmTable 中根据 type 渲染不同列（operation 有"操作"列，holding 没有）。命名变更后，现有的 `TradeRow` 和 `PositionRow` 接口是否也重命名为 `OperationRow` 和 `HoldingRow`？
  Answer: 重新命名
