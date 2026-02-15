import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { searchStocks } from "@/lib/stock/service";
import { chatCompletion } from "@/lib/ai/client";
import type { StockSearchResult } from "@/lib/stock/types";

/**
 * 根据 ticker / 市场推断币种
 *  - .HK 后缀 → HKD
 *  - .SS / .SZ 后缀（A 股）→ CNY
 *  - 无后缀（美股）→ USD
 */
export function inferCurrency(ticker: string): string {
  const upper = ticker.toUpperCase();
  if (upper.endsWith(".HK")) return "HKD";
  if (upper.endsWith(".SS") || upper.endsWith(".SZ")) return "CNY";
  return "USD";
}

/**
 * ai-search 后备搜索（复用 ai-search 的 prompt 逻辑，但作为内部函数调用）
 */
const AI_SEARCH_PROMPT = `你是一个股票识别助手。用户会输入一个模糊的股票查询，你需要从美股、港股、A股中找到最可能匹配的股票。
返回一个 JSON 数组，每个元素包含：
- ticker: 股票代码（美股如 "AAPL"，港股如 "0700.HK"，A股上交所如 "600519.SS"，深交所如 "000858.SZ"）
- name: 英文全称
- nameCN: 中文名称
- primaryExchange: 交易所
- currencyName: 交易货币
规则：最多返回 3 个最相关的结果。只返回 JSON 数组，不要任何解释文字。`;

async function aiSearchFallback(query: string): Promise<StockSearchResult[]> {
  try {
    const raw = await chatCompletion([
      { role: "system", content: AI_SEARCH_PROMPT },
      { role: "user", content: query },
    ]);
    const jsonStr = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

/**
 * LangChain Tool: stock_search
 *
 * 供 Agent 在解析文本时调用，查找股票的正确 ticker。
 * 先查本地 DB / Massive API，找不到则 fallback 到 AI 搜索。
 */
export const stockSearchTool = new DynamicStructuredTool({
  name: "stock_search",
  description:
    "搜索股票信息，获取正确的 ticker 代码、市场和币种。" +
    "输入股票名称（中文或英文）或代码，返回最匹配的结果。" +
    "如果找不到，返回 found=false。",
  schema: z.object({
    query: z.string().describe("股票名称或代码，如 '腾讯'、'AAPL'、'泡泡玛特'"),
  }),
  func: async ({ query }): Promise<string> => {
    // 1) 先查本地 DB + Massive API
    const results = await searchStocks(query, 3);
    if (results.length > 0) {
      const top = results[0];
      return JSON.stringify({
        found: true,
        ticker: top.ticker,
        name: top.name,
        nameCN: top.nameCN || "",
        currency: top.currencyName
          ? top.currencyName.toUpperCase()
          : inferCurrency(top.ticker),
      });
    }

    // 2) Fallback → AI 搜索
    const aiResults = await aiSearchFallback(query);
    if (aiResults.length > 0) {
      const top = aiResults[0];
      return JSON.stringify({
        found: true,
        ticker: top.ticker,
        name: top.name,
        nameCN: top.nameCN || "",
        currency: top.currencyName
          ? top.currencyName.toUpperCase()
          : inferCurrency(top.ticker),
      });
    }

    // 3) 都找不到
    return JSON.stringify({ found: false, ticker: "UNKNOWN", name: query, currency: "" });
  },
});
