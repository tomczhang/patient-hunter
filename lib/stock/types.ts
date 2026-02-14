// ============ Massive API 原始响应类型 ============

/** Massive API 通用响应包装 */
export interface MassiveResponse<T> {
  status: string;
  request_id: string;
  count?: number;
  results: T;
  next_url?: string;
}

/** Ticker Overview 详情 */
export interface MassiveTickerDetail {
  ticker: string;
  name: string;
  active: boolean;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  currency_name: string;
  description?: string;
  homepage_url?: string;
  market_cap?: number;
  total_employees?: number;
  list_date?: string;
  sic_code?: string;
  sic_description?: string;
  branding?: {
    logo_url?: string;
    icon_url?: string;
  };
  address?: {
    address1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
}

/** All Tickers 搜索结果（单个 ticker） */
export interface MassiveTickerListItem {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name?: string;
  last_updated_utc?: string;
}

/** OHLC Bar */
export interface MassiveBar {
  o: number;  // 开盘
  h: number;  // 最高
  l: number;  // 最低
  c: number;  // 收盘
  v: number;  // 成交量
  vw: number; // VWAP
  t: number;  // 时间戳 (ms)
  n: number;  // 成交笔数
}

/** Custom Bars API 响应 */
export interface MassiveBarsResponse {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: MassiveBar[];
  status: string;
  request_id: string;
  count: number;
  next_url?: string;
}

// ============ 业务层类型 ============

/** 统一的股票搜索结果 */
export interface StockSearchResult {
  ticker: string;
  name: string;
  nameCN?: string;
  primaryExchange: string;
  type?: string;
  currencyName?: string;
  active?: boolean;
}

/** 股票详情（给前端用） */
export interface StockDetail {
  ticker: string;
  name: string;
  nameCN?: string;
  description?: string;
  marketCap?: number;
  primaryExchange: string;
  currencyName: string;
  homepageUrl?: string;
  logoUrl?: string;
  listDate?: string;
  totalEmployees?: number;
  sicDescription?: string;
}

/** OHLC Bar（给前端用） */
export interface OHLCBar {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw: number;
  t: number;   // 时间戳 ms
}

/** 6 个月高点结果 */
export interface SixMonthHigh {
  ticker: string;
  highPrice: number;
  highDate: string;      // YYYY-MM-DD
  currentPrice: number;  // 最近一个交易日收盘价
  dropFromHigh: number;  // 距离高点跌幅百分比
}

/** 宽指组合跌幅 */
export interface IndexDrop {
  voo: SixMonthHigh;
  qqqm: SixMonthHigh;
  combinedDrop: number;   // 加权跌幅百分比（保留两位小数）
  weights: { voo: number; qqqm: number };
}

/** Timespan 枚举 */
export type Timespan = "minute" | "hour" | "day" | "week" | "month";
