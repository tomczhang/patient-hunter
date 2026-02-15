import type {
  ImageType,
  TradeParseResult,
  PositionParseResult,
} from "../types";
import { parseTrades } from "./trade-parser";
import { parsePositions } from "./position-parser";

type ParseResult = TradeParseResult | PositionParseResult | null;

/**
 * 根据分类结果分发到对应的解析器
 *
 * @param imageUrl  Base64 data URL
 * @param type      分类结果
 * @param context   可选的用户文字上下文
 */
export async function dispatchParser(
  imageUrl: string,
  type: ImageType,
  context?: string,
): Promise<ParseResult> {
  switch (type) {
    case "trade_record":
      return parseTrades(imageUrl, context);
    case "position":
      return parsePositions(imageUrl, context);
    case "unknown":
    default:
      return null;
  }
}
