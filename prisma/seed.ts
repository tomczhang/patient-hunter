import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** 热门股票中文名称映射（含市场标识） */
const STOCK_NAMES: { ticker: string; nameEN: string; nameCN: string; market: string }[] = [
  // ===== 美股 - 科技 =====
  { ticker: "AAPL", nameEN: "Apple Inc.", nameCN: "苹果", market: "US" },
  { ticker: "MSFT", nameEN: "Microsoft Corporation", nameCN: "微软", market: "US" },
  { ticker: "GOOGL", nameEN: "Alphabet Inc.", nameCN: "谷歌", market: "US" },
  { ticker: "GOOG", nameEN: "Alphabet Inc.", nameCN: "谷歌", market: "US" },
  { ticker: "AMZN", nameEN: "Amazon.com Inc.", nameCN: "亚马逊", market: "US" },
  { ticker: "META", nameEN: "Meta Platforms Inc.", nameCN: "Meta（脸书）", market: "US" },
  { ticker: "NVDA", nameEN: "NVIDIA Corporation", nameCN: "英伟达", market: "US" },
  { ticker: "TSLA", nameEN: "Tesla Inc.", nameCN: "特斯拉", market: "US" },
  { ticker: "TSM", nameEN: "Taiwan Semiconductor Manufacturing", nameCN: "台积电", market: "US" },
  { ticker: "AVGO", nameEN: "Broadcom Inc.", nameCN: "博通", market: "US" },
  { ticker: "ORCL", nameEN: "Oracle Corporation", nameCN: "甲骨文", market: "US" },
  { ticker: "CRM", nameEN: "Salesforce Inc.", nameCN: "赛富时", market: "US" },
  { ticker: "AMD", nameEN: "Advanced Micro Devices Inc.", nameCN: "超威半导体", market: "US" },
  { ticker: "ADBE", nameEN: "Adobe Inc.", nameCN: "奥多比", market: "US" },
  { ticker: "INTC", nameEN: "Intel Corporation", nameCN: "英特尔", market: "US" },
  { ticker: "CSCO", nameEN: "Cisco Systems Inc.", nameCN: "思科", market: "US" },
  { ticker: "QCOM", nameEN: "Qualcomm Inc.", nameCN: "高通", market: "US" },
  { ticker: "IBM", nameEN: "International Business Machines", nameCN: "IBM", market: "US" },
  { ticker: "TXN", nameEN: "Texas Instruments Inc.", nameCN: "德州仪器", market: "US" },
  { ticker: "NOW", nameEN: "ServiceNow Inc.", nameCN: "ServiceNow", market: "US" },
  { ticker: "INTU", nameEN: "Intuit Inc.", nameCN: "Intuit", market: "US" },
  { ticker: "AMAT", nameEN: "Applied Materials Inc.", nameCN: "应用材料", market: "US" },
  { ticker: "MU", nameEN: "Micron Technology Inc.", nameCN: "美光科技", market: "US" },
  { ticker: "LRCX", nameEN: "Lam Research Corporation", nameCN: "拉姆研究", market: "US" },
  { ticker: "KLAC", nameEN: "KLA Corporation", nameCN: "科磊", market: "US" },
  { ticker: "SNPS", nameEN: "Synopsys Inc.", nameCN: "新思科技", market: "US" },
  { ticker: "CDNS", nameEN: "Cadence Design Systems", nameCN: "楷登电子", market: "US" },
  { ticker: "PANW", nameEN: "Palo Alto Networks Inc.", nameCN: "派拓网络", market: "US" },
  { ticker: "CRWD", nameEN: "CrowdStrike Holdings Inc.", nameCN: "CrowdStrike", market: "US" },
  { ticker: "SNOW", nameEN: "Snowflake Inc.", nameCN: "Snowflake", market: "US" },
  { ticker: "PLTR", nameEN: "Palantir Technologies Inc.", nameCN: "Palantir", market: "US" },
  { ticker: "NET", nameEN: "Cloudflare Inc.", nameCN: "Cloudflare", market: "US" },
  { ticker: "SHOP", nameEN: "Shopify Inc.", nameCN: "Shopify", market: "US" },
  { ticker: "SQ", nameEN: "Block Inc.", nameCN: "Block", market: "US" },
  { ticker: "UBER", nameEN: "Uber Technologies Inc.", nameCN: "优步", market: "US" },
  { ticker: "ABNB", nameEN: "Airbnb Inc.", nameCN: "爱彼迎", market: "US" },
  { ticker: "COIN", nameEN: "Coinbase Global Inc.", nameCN: "Coinbase", market: "US" },

  // ===== 美股 - 金融 =====
  { ticker: "BRK.B", nameEN: "Berkshire Hathaway Inc.", nameCN: "伯克希尔", market: "US" },
  { ticker: "JPM", nameEN: "JPMorgan Chase & Co.", nameCN: "摩根大通", market: "US" },
  { ticker: "V", nameEN: "Visa Inc.", nameCN: "维萨", market: "US" },
  { ticker: "MA", nameEN: "Mastercard Inc.", nameCN: "万事达", market: "US" },
  { ticker: "BAC", nameEN: "Bank of America Corp.", nameCN: "美国银行", market: "US" },
  { ticker: "WFC", nameEN: "Wells Fargo & Company", nameCN: "富国银行", market: "US" },
  { ticker: "GS", nameEN: "Goldman Sachs Group Inc.", nameCN: "高盛", market: "US" },
  { ticker: "MS", nameEN: "Morgan Stanley", nameCN: "摩根士丹利", market: "US" },
  { ticker: "C", nameEN: "Citigroup Inc.", nameCN: "花旗", market: "US" },
  { ticker: "AXP", nameEN: "American Express Company", nameCN: "美国运通", market: "US" },
  { ticker: "PYPL", nameEN: "PayPal Holdings Inc.", nameCN: "贝宝", market: "US" },

  // ===== 美股 - 医疗健康 =====
  { ticker: "UNH", nameEN: "UnitedHealth Group Inc.", nameCN: "联合健康", market: "US" },
  { ticker: "JNJ", nameEN: "Johnson & Johnson", nameCN: "强生", market: "US" },
  { ticker: "LLY", nameEN: "Eli Lilly and Company", nameCN: "礼来", market: "US" },
  { ticker: "ABBV", nameEN: "AbbVie Inc.", nameCN: "艾伯维", market: "US" },
  { ticker: "MRK", nameEN: "Merck & Co. Inc.", nameCN: "默沙东", market: "US" },
  { ticker: "PFE", nameEN: "Pfizer Inc.", nameCN: "辉瑞", market: "US" },
  { ticker: "TMO", nameEN: "Thermo Fisher Scientific", nameCN: "赛默飞", market: "US" },
  { ticker: "ABT", nameEN: "Abbott Laboratories", nameCN: "雅培", market: "US" },
  { ticker: "DHR", nameEN: "Danaher Corporation", nameCN: "丹纳赫", market: "US" },
  { ticker: "BMY", nameEN: "Bristol-Myers Squibb", nameCN: "百时美施贵宝", market: "US" },
  { ticker: "AMGN", nameEN: "Amgen Inc.", nameCN: "安进", market: "US" },
  { ticker: "GILD", nameEN: "Gilead Sciences Inc.", nameCN: "吉利德", market: "US" },
  { ticker: "NVO", nameEN: "Novo Nordisk A/S", nameCN: "诺和诺德", market: "US" },

  // ===== 美股 - 消费 =====
  { ticker: "WMT", nameEN: "Walmart Inc.", nameCN: "沃尔玛", market: "US" },
  { ticker: "PG", nameEN: "Procter & Gamble Company", nameCN: "宝洁", market: "US" },
  { ticker: "KO", nameEN: "Coca-Cola Company", nameCN: "可口可乐", market: "US" },
  { ticker: "PEP", nameEN: "PepsiCo Inc.", nameCN: "百事可乐", market: "US" },
  { ticker: "COST", nameEN: "Costco Wholesale Corp.", nameCN: "好市多", market: "US" },
  { ticker: "MCD", nameEN: "McDonald's Corporation", nameCN: "麦当劳", market: "US" },
  { ticker: "SBUX", nameEN: "Starbucks Corporation", nameCN: "星巴克", market: "US" },
  { ticker: "NKE", nameEN: "Nike Inc.", nameCN: "耐克", market: "US" },
  { ticker: "DIS", nameEN: "Walt Disney Company", nameCN: "迪士尼", market: "US" },
  { ticker: "NFLX", nameEN: "Netflix Inc.", nameCN: "奈飞", market: "US" },
  { ticker: "HD", nameEN: "Home Depot Inc.", nameCN: "家得宝", market: "US" },
  { ticker: "LOW", nameEN: "Lowe's Companies Inc.", nameCN: "劳氏", market: "US" },
  { ticker: "TGT", nameEN: "Target Corporation", nameCN: "塔吉特", market: "US" },

  // ===== 美股 - 工业 =====
  { ticker: "CAT", nameEN: "Caterpillar Inc.", nameCN: "卡特彼勒", market: "US" },
  { ticker: "BA", nameEN: "Boeing Company", nameCN: "波音", market: "US" },
  { ticker: "GE", nameEN: "GE Aerospace", nameCN: "通用电气", market: "US" },
  { ticker: "HON", nameEN: "Honeywell International", nameCN: "霍尼韦尔", market: "US" },
  { ticker: "UPS", nameEN: "United Parcel Service", nameCN: "联合包裹", market: "US" },
  { ticker: "RTX", nameEN: "RTX Corporation", nameCN: "雷神", market: "US" },
  { ticker: "LMT", nameEN: "Lockheed Martin Corp.", nameCN: "洛克希德马丁", market: "US" },
  { ticker: "DE", nameEN: "Deere & Company", nameCN: "迪尔", market: "US" },

  // ===== 美股 - 能源 =====
  { ticker: "XOM", nameEN: "Exxon Mobil Corporation", nameCN: "埃克森美孚", market: "US" },
  { ticker: "CVX", nameEN: "Chevron Corporation", nameCN: "雪佛龙", market: "US" },
  { ticker: "COP", nameEN: "ConocoPhillips", nameCN: "康菲石油", market: "US" },

  // ===== 美股 - 通信 =====
  { ticker: "T", nameEN: "AT&T Inc.", nameCN: "AT&T", market: "US" },
  { ticker: "VZ", nameEN: "Verizon Communications", nameCN: "威瑞森", market: "US" },
  { ticker: "TMUS", nameEN: "T-Mobile US Inc.", nameCN: "T-Mobile", market: "US" },
  { ticker: "CMCSA", nameEN: "Comcast Corporation", nameCN: "康卡斯特", market: "US" },

  // ===== 美股 - 中概股 =====
  { ticker: "BABA", nameEN: "Alibaba Group Holding", nameCN: "阿里巴巴", market: "US" },
  { ticker: "PDD", nameEN: "PDD Holdings Inc.", nameCN: "拼多多", market: "US" },
  { ticker: "JD", nameEN: "JD.com Inc.", nameCN: "京东", market: "US" },
  { ticker: "BIDU", nameEN: "Baidu Inc.", nameCN: "百度", market: "US" },
  { ticker: "NIO", nameEN: "NIO Inc.", nameCN: "蔚来", market: "US" },
  { ticker: "XPEV", nameEN: "XPeng Inc.", nameCN: "小鹏汽车", market: "US" },
  { ticker: "LI", nameEN: "Li Auto Inc.", nameCN: "理想汽车", market: "US" },
  { ticker: "BILI", nameEN: "Bilibili Inc.", nameCN: "哔哩哔哩", market: "US" },
  { ticker: "TME", nameEN: "Tencent Music Entertainment", nameCN: "腾讯音乐", market: "US" },
  { ticker: "ZH", nameEN: "Zhihu Inc.", nameCN: "知乎", market: "US" },
  { ticker: "FUTU", nameEN: "Futu Holdings Limited", nameCN: "富途", market: "US" },
  { ticker: "TIGR", nameEN: "UP Fintech Holding", nameCN: "老虎证券", market: "US" },

  // ===== 港股 =====
  { ticker: "9992.HK", nameEN: "Pop Mart International Group Ltd.", nameCN: "泡泡玛特", market: "HK" },
  { ticker: "0175.HK", nameEN: "Geely Automobile Holdings Ltd.", nameCN: "吉利汽车", market: "HK" },
  { ticker: "1816.HK", nameEN: "CGN Power Co. Ltd.", nameCN: "中广核电力", market: "HK" },

  // ===== A股 =====
  { ticker: "600519.SS", nameEN: "Kweichow Moutai Co. Ltd.", nameCN: "贵州茅台", market: "CN" },
];

async function main() {
  console.log("🌱 开始导入股票中文名称映射...");

  let created = 0;
  let updated = 0;

  for (const stock of STOCK_NAMES) {
    const existing = await prisma.stockNameCN.findUnique({
      where: { ticker: stock.ticker },
    });

    await prisma.stockNameCN.upsert({
      where: { ticker: stock.ticker },
      update: {
        nameEN: stock.nameEN,
        nameCN: stock.nameCN,
        market: stock.market,
      },
      create: {
        ticker: stock.ticker,
        nameEN: stock.nameEN,
        nameCN: stock.nameCN,
        market: stock.market,
        source: "seed",
      },
    });

    if (existing) {
      updated++;
    } else {
      created++;
    }
  }

  console.log(
    `✅ 完成！新增 ${created} 条，更新 ${updated} 条，共 ${STOCK_NAMES.length} 条。`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed 失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
