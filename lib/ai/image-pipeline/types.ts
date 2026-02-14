import { z } from "zod";

// ============ 图片类型 ============

export const IMAGE_TYPES = ["trade_record", "position", "unknown"] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

// ============ Step 1: 分类 Schema ============

export const ClassifySchema = z.object({
  type: z.enum(IMAGE_TYPES).describe("图片所属类型"),
  confidence: z.number().min(0).max(1).describe("置信度 0-1"),
  reason: z.string().describe("判断理由（简要）"),
});

export type ClassifyResult = z.infer<typeof ClassifySchema>;

// ============ Step 2: 交易记录 Schema ============

export const TradeItemSchema = z.object({
  ticker: z.string().describe("股票代码，如 AAPL"),
  name: z.string().optional().describe("股票名称"),
  action: z.enum(["buy", "sell"]).describe("买入或卖出"),
  quantity: z.number().describe("数量（股数）"),
  price: z.number().describe("成交价格"),
  currency: z.string().optional().describe("币种 USD/HKD/CNY"),
  tradedAt: z.string().optional().describe("成交日期 YYYY-MM-DD"),
  memo: z.string().optional().describe("备注"),
});

export const TradeParseSchema = z.object({
  trades: z.array(TradeItemSchema).describe("提取到的交易记录列表"),
});

export type TradeParseResult = z.infer<typeof TradeParseSchema>;

// ============ Step 2: 持仓 Schema ============

export const PositionItemSchema = z.object({
  ticker: z.string().describe("股票代码，如 AAPL"),
  name: z.string().optional().describe("股票名称"),
  quantity: z.number().describe("持仓数量（股数）"),
  costPrice: z.number().describe("成本价"),
  currentPrice: z.number().optional().describe("当前价格"),
  currency: z.string().optional().describe("币种 USD/HKD/CNY"),
  pnl: z.number().optional().describe("盈亏金额"),
  pnlPercent: z.number().optional().describe("盈亏百分比"),
});

export const PositionParseSchema = z.object({
  positions: z.array(PositionItemSchema).describe("提取到的持仓列表"),
});

export type PositionParseResult = z.infer<typeof PositionParseSchema>;

// ============ Pipeline 统一输出 ============

export interface ImageParseOutput {
  /** 图片分类结果 */
  type: ImageType;
  /** 分类置信度 */
  confidence: number;
  /** 分类理由 */
  reason: string;
  /** 结构化数据（按 type 不同而不同） */
  data: TradeParseResult | PositionParseResult | null;
  /** 原始 OCR 文字（兜底 / 调试用） */
  rawText?: string;
}
