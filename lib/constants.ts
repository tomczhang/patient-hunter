import type { NavItem, LegendItem, AssetTypeOption } from "@/types";

/** 顶部导航 */
export const NAV_ITEMS: NavItem[] = [
  { label: "仪表盘", href: "/" },
  { label: "分析", href: "/analysis" },
  { label: "报告", href: "/reports" },
  { label: "设置", href: "/settings" },
];

/** Portfolio Tab 标签 */
export const PORTFOLIO_TABS = [
  "仓位水位",
  "现金流",
  "资产面板",
  "关注列表",
];

/** 资产分配图例 */
export const ALLOCATION_LEGEND: LegendItem[] = [
  { color: "c-purple", label: "美股 (45%)" },
  { color: "c-yellow", label: "国际股票 (28%)" },
  { color: "c-black", label: "现金及等价物 (13%)" },
];

/** 资产类型选项 */
export const ASSET_TYPES: AssetTypeOption[] = [
  { id: "stock", label: "股票", icon: "M3 17l4-4 4 4 4-8 4 4V3" },
  { id: "etf", label: "ETF/基金", icon: "M4 4h16v16H4zM4 12h16M12 4v16" },
  { id: "crypto", label: "加密货币", icon: "M12 2a10 10 0 100 20 10 10 0 000-20zm1 4v1h2v2h-3v2h3v2h-2v1h-2v-1H9v-2h3V9H9V7h2V6z" },
  { id: "realestate", label: "房产", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
];

/** 风险偏好分类 */
export const RISK_CATEGORIES = [
  { value: "aggressive", label: "进取仓" },
  { value: "balanced", label: "稳健仓" },
  { value: "defensive", label: "防守仓" },
];

/** 币种列表 */
export const CURRENCIES = [
  { value: "USD", label: "USD — 美元" },
  { value: "HKD", label: "HKD — 港元" },
  { value: "CNY", label: "CNY — 人民币" },
];

/** 模拟股票搜索数据 */
export const MOCK_STOCKS = [
  { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
  { ticker: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
  { ticker: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
  { ticker: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
  { ticker: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
  { ticker: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
  { ticker: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
  { ticker: "0700.HK", name: "腾讯控股", exchange: "HKEX" },
  { ticker: "9988.HK", name: "阿里巴巴", exchange: "HKEX" },
  { ticker: "600519.SH", name: "贵州茅台", exchange: "SSE" },
  { ticker: "000858.SZ", name: "五粮液", exchange: "SZSE" },
];
