import type {
  MassiveResponse,
  MassiveTickerDetail,
  MassiveTickerListItem,
  MassiveBar,
  MassiveBarsResponse,
  Timespan,
} from "./types";

const MASSIVE_BASE_URL = "https://api.massive.com";

function getApiKey(): string {
  const key = process.env.MASSIVE_API_KEY;
  if (!key) throw new Error("未配置 MASSIVE_API_KEY");
  return key;
}

/** 通用 fetch 封装 */
async function massiveFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, MASSIVE_BASE_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getApiKey()}` },
    next: { revalidate: 60 }, // Next.js ISR 缓存 60s
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Massive API 调用失败 (${response.status}): ${detail}`);
  }

  return response.json() as Promise<T>;
}

// ============ 公开 API ============

/**
 * 搜索股票（All Tickers）
 * GET /v3/reference/tickers?search=xxx&market=stocks&active=true
 */
export async function searchTickers(
  query: string,
  limit = 10,
): Promise<MassiveTickerListItem[]> {
  const data = await massiveFetch<MassiveResponse<MassiveTickerListItem[]>>(
    "/v3/reference/tickers",
    {
      search: query,
      market: "stocks",
      active: "true",
      limit: String(limit),
      sort: "ticker",
      order: "asc",
    },
  );
  return data.results ?? [];
}

/**
 * 获取单只股票详情（Ticker Overview）
 * GET /v3/reference/tickers/{ticker}
 */
export async function getTickerDetail(
  ticker: string,
): Promise<MassiveTickerDetail | null> {
  try {
    const data = await massiveFetch<MassiveResponse<MassiveTickerDetail>>(
      `/v3/reference/tickers/${encodeURIComponent(ticker.toUpperCase())}`,
    );
    return data.results ?? null;
  } catch (e) {
    // 404 → 返回 null
    if (e instanceof Error && e.message.includes("404")) return null;
    throw e;
  }
}

/**
 * 获取 OHLC 行情（Custom Bars）
 * GET /v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}
 */
export async function getBars(
  ticker: string,
  timespan: Timespan,
  from: string,
  to: string,
  multiplier = 1,
  options?: { adjusted?: boolean; sort?: "asc" | "desc"; limit?: number },
): Promise<MassiveBar[]> {
  const { adjusted = true, sort = "asc", limit = 5000 } = options ?? {};

  const data = await massiveFetch<MassiveBarsResponse>(
    `/v2/aggs/ticker/${encodeURIComponent(ticker.toUpperCase())}/range/${multiplier}/${timespan}/${from}/${to}`,
    {
      adjusted: String(adjusted),
      sort,
      limit: String(limit),
    },
  );
  return data.results ?? [];
}
