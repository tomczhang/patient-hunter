import { prisma } from "@/lib/prisma";
import { chatCompletion } from "@/lib/ai/client";
import { searchTickers, getTickerDetail, getBars } from "./client";
import type {
  StockSearchResult,
  StockDetail,
  OHLCBar,
  SixMonthHigh,
  IndexDrop,
  Timespan,
  MassiveTickerListItem,
} from "./types";

// ============ 中文名称映射 ============

/** 判断是否包含中文字符 */
export function isChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/** 从本地 DB 获取中文名（如有） */
async function getChineseNameFromDB(ticker: string): Promise<string | null> {
  const record = await prisma.stockNameCN.findUnique({
    where: { ticker: ticker.toUpperCase() },
  });
  return record?.nameCN ?? null;
}

/** 批量获取中文名 */
async function getChineseNamesFromDB(
  tickers: string[],
): Promise<Map<string, string>> {
  if (tickers.length === 0) return new Map();
  const records = await prisma.stockNameCN.findMany({
    where: { ticker: { in: tickers.map((t) => t.toUpperCase()) } },
  });
  const map = new Map<string, string>();
  for (const r of records) {
    map.set(r.ticker, r.nameCN);
  }
  return map;
}

/** 使用 LLM 翻译英文公司名为中文，并缓存到 DB */
async function translateAndCacheName(
  ticker: string,
  englishName: string,
): Promise<string> {
  try {
    const translated = await chatCompletion([
      {
        role: "user",
        content: `将以下美股公司名翻译为中文常用名称，只返回中文名，不要解释、不要引号：${englishName}`,
      },
    ]);
    const nameCN = translated.trim();

    // 存入映射表
    await prisma.stockNameCN.upsert({
      where: { ticker: ticker.toUpperCase() },
      update: { nameCN, nameEN: englishName },
      create: {
        ticker: ticker.toUpperCase(),
        nameEN: englishName,
        nameCN,
        source: "llm",
      },
    });

    return nameCN;
  } catch {
    // LLM 不可用时降级返回英文名
    return englishName;
  }
}

// ============ 业务层方法 ============

/**
 * 搜索股票（支持中英文）
 * - 中文：查本地 StockNameCN 表
 * - 英文/ticker：查 Massive API，并补充中文名
 */
export async function searchStocks(
  query: string,
  limit = 10,
): Promise<StockSearchResult[]> {
  if (isChinese(query)) {
    // 中文搜索 → 本地 DB
    const records = await prisma.stockNameCN.findMany({
      where: { nameCN: { contains: query } },
      take: limit,
    });

    console.log("records", records);
    return records.map((r) => ({
      ticker: r.ticker,
      name: r.nameEN,
      nameCN: r.nameCN,
      primaryExchange: "", // 本地 DB 暂无交易所信息
    }));
  }

  // 英文搜索 → Massive API
  const results: MassiveTickerListItem[] = await searchTickers(query, limit);

  // 批量查本地中文名
  const tickers = results.map((r) => r.ticker);
  const cnNames = await getChineseNamesFromDB(tickers);

  return results.map((r) => ({
    ticker: r.ticker,
    name: r.name,
    nameCN: cnNames.get(r.ticker),
    primaryExchange: r.primary_exchange,
    type: r.type,
    currencyName: r.currency_name,
    active: r.active,
  }));
}

/**
 * 获取股票详情（含中文名自动翻译）
 */
export async function getStockDetail(ticker: string): Promise<StockDetail | null> {
  const detail = await getTickerDetail(ticker);
  if (!detail) return null;

  // 获取中文名：先查 DB，没有就 LLM 翻译
  let nameCN = await getChineseNameFromDB(detail.ticker);
  if (!nameCN) {
    nameCN = await translateAndCacheName(detail.ticker, detail.name);
  }

  return {
    ticker: detail.ticker,
    name: detail.name,
    nameCN,
    description: detail.description,
    marketCap: detail.market_cap,
    primaryExchange: detail.primary_exchange,
    currencyName: detail.currency_name,
    homepageUrl: detail.homepage_url,
    logoUrl: detail.branding?.logo_url,
    listDate: detail.list_date,
    totalEmployees: detail.total_employees,
    sicDescription: detail.sic_description,
  };
}

/**
 * 获取 K 线行情
 */
export async function getStockBars(
  ticker: string,
  timespan: Timespan,
  from: string,
  to: string,
  multiplier = 1,
): Promise<OHLCBar[]> {
  const bars = await getBars(ticker, timespan, from, to, multiplier);
  return bars.map((b) => ({
    o: b.o,
    h: b.h,
    l: b.l,
    c: b.c,
    v: b.v,
    vw: b.vw,
    t: b.t,
  }));
}

/**
 * 获取近 6 个月最高价
 */
export async function getSixMonthHigh(ticker: string): Promise<SixMonthHigh | null> {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const from = formatDate(sixMonthsAgo);
  const to = formatDate(now);

  const bars = await getBars(ticker, "day", from, to);
  if (!bars || bars.length === 0) return null;

  // 找最高价
  let maxBar = bars[0];
  for (const bar of bars) {
    if (bar.h > maxBar.h) {
      maxBar = bar;
    }
  }

  // 最近一个交易日的收盘价
  const latestBar = bars[bars.length - 1];
  const currentPrice = latestBar.c;

  const highPrice = maxBar.h;
  const dropFromHigh = ((currentPrice - highPrice) / highPrice) * 100;

  return {
    ticker: ticker.toUpperCase(),
    highPrice,
    highDate: formatDate(new Date(maxBar.t)),
    currentPrice,
    dropFromHigh: Math.round(dropFromHigh * 100) / 100,
  };
}

/**
 * 宽指组合跌幅：70% VOO + 30% QQQM
 */
export async function getIndexDrop(): Promise<IndexDrop | null> {
  const [voo, qqqm] = await Promise.all([
    getSixMonthHigh("VOO"),
    getSixMonthHigh("QQQM"),
  ]);

  if (!voo || !qqqm) return null;

  const weights = { voo: 0.7, qqqm: 0.3 };
  const combinedDrop =
    Math.round((weights.voo * voo.dropFromHigh + weights.qqqm * qqqm.dropFromHigh) * 100) / 100;

  return { voo, qqqm, combinedDrop, weights };
}

// ============ 工具函数 ============

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
