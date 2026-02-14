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
 */
export async function dispatchParser(
  imageUrl: string,
  type: ImageType,
): Promise<ParseResult> {
  switch (type) {
    case "trade_record":
      return parseTrades(imageUrl);
    case "position":
      return parsePositions(imageUrl);
    case "unknown":
    default:
      return null;
  }
}
