# 目的
目前的新增资产，使用langChain来实现的，节点中的prompt很大，节点和节点之前的串联有些乱。我希望可以使用langGraph调整这段逻辑，使每个节点中的逻辑更加清晰。流程是初始输入允许用户使用chatInput输入，并根据llm来尝试组织用户操作或者持仓信息。若信息完整，则展示为table让用户确认，用户可以直接在UI上修改并保存数据库（非llm链路）。若信息缺失，也在UI上进行提醒，并允许用户在table中进行补全，最终确认后保存数据库。具体描述股票交易系统的State、Node和Edge如下

## State
sessionId: 用户隔绝不同用户和会话
messages: 所有的聊天记录
input: 用户的输入
extractedInfo: 已经结构化的数据
inputType: 用户的输入类型，两种类型image、text
task: 用户输入的目的，三种类型operation、holding
phase: 用户输入的阶段，四种状态new、comfirming、editing、done
missingFields: 缺少的数据，格式是string[]
reviewPayload: 给UI的table数据和提示
eventType: 输入类型，两种类型NEW_INPUT和UI_SUBMIT


## Node
ingest: 用户输入规范化
intent_classify: 意图判断
preprocess: 图片/文字解析文字
extract_operation: 操作记录解析
extract_holding: 持仓记录解析
check_missing: 内容是否完整校验
present_review：用户确认卡片的数据和提示
store_db: 存入数据库

## Edge
### 1. 新输入路径
START -> ingest -> intent_classify -> image/text -> preprocess -> extract -> check_missing -> present_review -> END

### 2. 数据确认&入库
START -> entry -> store_db -> END


## 额外描述
operation的列如下：
股票代码、股票名称、股票操作、股数、操作的价格、时间

holding的列如下：
股票代码、股票名称、股数、成本、建仓时间


