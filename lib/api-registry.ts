/* ===== API 端点注册表 ===== */

export interface ApiParam {
  key: string;
  in: "path" | "query" | "body";
  required: boolean;
  placeholder?: string;
  default?: string;
  description?: string;
}

export interface ApiEndpoint {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  group: string;
  description?: string;
  params: ApiParam[];
  bodyExample?: string;
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  /* ---- 系统 ---- */
  {
    name: "健康检查",
    method: "GET",
    path: "/api/health",
    group: "系统",
    description: "检查服务和数据库连接状态",
    params: [],
  },

  /* ---- AI ---- */
  {
    name: "图片 OCR",
    method: "POST",
    path: "/api/ai/ocr",
    group: "AI",
    description: "从图片中提取文字（需要 base64 图片数据）",
    params: [
      { key: "imageBase64", in: "body", required: true, description: "图片 Base64 Data URL" },
      { key: "prompt", in: "body", required: false, description: "自定义提示词" },
    ],
    bodyExample: JSON.stringify(
      { imageBase64: "data:image/png;base64,...", prompt: "请提取这张图片中的所有文字内容" },
      null,
      2,
    ),
  },

  /* ---- 股票 ---- */
  {
    name: "股票搜索",
    method: "GET",
    path: "/api/stock/search",
    group: "股票",
    description: "根据名字或代码搜索股票（支持中英文）",
    params: [
      { key: "q", in: "query", required: true, placeholder: "apple", description: "搜索关键词" },
      { key: "limit", in: "query", required: false, default: "10", placeholder: "10", description: "返回数量上限 (≤50)" },
    ],
  },
  {
    name: "股票详情",
    method: "GET",
    path: "/api/stock/{ticker}",
    group: "股票",
    description: "获取单只股票详情（含中文名自动翻译）",
    params: [
      { key: "ticker", in: "path", required: true, placeholder: "AAPL", description: "股票代码" },
    ],
  },
  {
    name: "K 线行情",
    method: "GET",
    path: "/api/stock/{ticker}/bars",
    group: "股票",
    description: "获取 K 线行情（OHLC），支持分钟/小时/日/周/月",
    params: [
      { key: "ticker", in: "path", required: true, placeholder: "AAPL", description: "股票代码" },
      { key: "timespan", in: "query", required: true, placeholder: "day", description: "minute | hour | day | week | month" },
      { key: "from", in: "query", required: true, placeholder: "2025-08-01", description: "开始日期 YYYY-MM-DD" },
      { key: "to", in: "query", required: true, placeholder: "2026-02-01", description: "结束日期 YYYY-MM-DD" },
      { key: "multiplier", in: "query", required: false, default: "1", placeholder: "1", description: "时间倍数" },
    ],
  },
  {
    name: "6 月高点",
    method: "GET",
    path: "/api/stock/{ticker}/high",
    group: "股票",
    description: "获取近 6 个月最高价及日期",
    params: [
      { key: "ticker", in: "path", required: true, placeholder: "AAPL", description: "股票代码" },
    ],
  },
];

/** 按 group 分组 */
export function groupEndpoints(): Record<string, ApiEndpoint[]> {
  const groups: Record<string, ApiEndpoint[]> = {};
  for (const ep of API_ENDPOINTS) {
    (groups[ep.group] ??= []).push(ep);
  }
  return groups;
}
