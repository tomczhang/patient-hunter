/** 图片文字识别 — 默认 prompt */
export const OCR_PROMPT = "请提取这张图片中的所有文字内容，并按原始排版格式输出。";

/** Step 1: 图片分类 prompt */
export const CLASSIFY_IMAGE_PROMPT = `你是一个金融图片分类器。请判断这张图片属于以下哪种类型：

1. trade_record — 交易记录截图（来自券商 App 的买入/卖出成交记录、委托记录等）
2. position — 持仓截图（来自券商 App 或 Excel 的持仓汇总，包含股票代码、数量、成本价等）
3. unknown — 无法判断的其他类型

判断依据：
- 交易记录通常包含"买入"/"卖出"/"成交"等关键词，有成交时间、成交价格
- 持仓截图通常包含"持仓"/"成本"/"市值"/"盈亏"等关键词，以表格形式展示多只股票
- 如果不确定，选择 unknown`;

/** Step 2: 交易记录提取 prompt */
export const PARSE_TRADE_PROMPT = `你是一个金融数据提取专家。请从这张交易记录截图中提取所有交易信息。

提取规则：
- ticker: 股票代码（如 AAPL、00700 等），如果图中只有中文名没有代码，ticker 填中文名
- name: 股票名称
- action: 买入填 "buy"，卖出填 "sell"
- quantity: 成交数量（股数），必须为正整数
- price: 成交单价
- currency: 币种（USD/HKD/CNY），根据图片上下文判断，无法判断则留空
- tradedAt: 成交日期，格式 YYYY-MM-DD，无法判断则留空
- memo: 其他备注信息（如订单号等）

注意：
- 每一笔交易是数组中的一个元素
- 如果图中有多笔交易，全部提取
- 数字不要包含千分位逗号`;

/** Step 2: 持仓截图提取 prompt */
export const PARSE_POSITION_PROMPT = `你是一个金融数据提取专家。请从这张持仓截图中提取所有持仓信息。

提取规则：
- ticker: 股票代码（如 AAPL、00700 等），如果图中只有中文名没有代码，ticker 填中文名
- name: 股票名称
- quantity: 持仓数量（股数），必须为正整数
- costPrice: 成本价（每股）
- currentPrice: 当前/最新价格，没有则留空
- currency: 币种（USD/HKD/CNY），根据图片上下文判断，无法判断则留空
- pnl: 盈亏金额，亏损为负数，没有则留空
- pnlPercent: 盈亏百分比（如 -5.2 表示亏损 5.2%），没有则留空

注意：
- 每只股票是数组中的一个元素
- 如果图中有多只股票，全部提取
- 数字不要包含千分位逗号`;
