import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** TOP 100 热门美股中文名称映射 */
const STOCK_NAMES: { ticker: string; nameEN: string; nameCN: string }[] = [
  // ===== 科技 =====
  { ticker: "AAPL", nameEN: "Apple Inc.", nameCN: "苹果" },
  { ticker: "MSFT", nameEN: "Microsoft Corporation", nameCN: "微软" },
  { ticker: "GOOGL", nameEN: "Alphabet Inc.", nameCN: "谷歌" },
  { ticker: "GOOG", nameEN: "Alphabet Inc.", nameCN: "谷歌" },
  { ticker: "AMZN", nameEN: "Amazon.com Inc.", nameCN: "亚马逊" },
  { ticker: "META", nameEN: "Meta Platforms Inc.", nameCN: "Meta（脸书）" },
  { ticker: "NVDA", nameEN: "NVIDIA Corporation", nameCN: "英伟达" },
  { ticker: "TSLA", nameEN: "Tesla Inc.", nameCN: "特斯拉" },
  { ticker: "TSM", nameEN: "Taiwan Semiconductor Manufacturing", nameCN: "台积电" },
  { ticker: "AVGO", nameEN: "Broadcom Inc.", nameCN: "博通" },
  { ticker: "ORCL", nameEN: "Oracle Corporation", nameCN: "甲骨文" },
  { ticker: "CRM", nameEN: "Salesforce Inc.", nameCN: "赛富时" },
  { ticker: "AMD", nameEN: "Advanced Micro Devices Inc.", nameCN: "超威半导体" },
  { ticker: "ADBE", nameEN: "Adobe Inc.", nameCN: "奥多比" },
  { ticker: "INTC", nameEN: "Intel Corporation", nameCN: "英特尔" },
  { ticker: "CSCO", nameEN: "Cisco Systems Inc.", nameCN: "思科" },
  { ticker: "QCOM", nameEN: "Qualcomm Inc.", nameCN: "高通" },
  { ticker: "IBM", nameEN: "International Business Machines", nameCN: "IBM" },
  { ticker: "TXN", nameEN: "Texas Instruments Inc.", nameCN: "德州仪器" },
  { ticker: "NOW", nameEN: "ServiceNow Inc.", nameCN: "ServiceNow" },
  { ticker: "INTU", nameEN: "Intuit Inc.", nameCN: "Intuit" },
  { ticker: "AMAT", nameEN: "Applied Materials Inc.", nameCN: "应用材料" },
  { ticker: "MU", nameEN: "Micron Technology Inc.", nameCN: "美光科技" },
  { ticker: "LRCX", nameEN: "Lam Research Corporation", nameCN: "拉姆研究" },
  { ticker: "KLAC", nameEN: "KLA Corporation", nameCN: "科磊" },
  { ticker: "SNPS", nameEN: "Synopsys Inc.", nameCN: "新思科技" },
  { ticker: "CDNS", nameEN: "Cadence Design Systems", nameCN: "楷登电子" },
  { ticker: "PANW", nameEN: "Palo Alto Networks Inc.", nameCN: "派拓网络" },
  { ticker: "CRWD", nameEN: "CrowdStrike Holdings Inc.", nameCN: "CrowdStrike" },
  { ticker: "SNOW", nameEN: "Snowflake Inc.", nameCN: "Snowflake" },
  { ticker: "PLTR", nameEN: "Palantir Technologies Inc.", nameCN: "Palantir" },
  { ticker: "NET", nameEN: "Cloudflare Inc.", nameCN: "Cloudflare" },
  { ticker: "SHOP", nameEN: "Shopify Inc.", nameCN: "Shopify" },
  { ticker: "SQ", nameEN: "Block Inc.", nameCN: "Block" },
  { ticker: "UBER", nameEN: "Uber Technologies Inc.", nameCN: "优步" },
  { ticker: "ABNB", nameEN: "Airbnb Inc.", nameCN: "爱彼迎" },
  { ticker: "COIN", nameEN: "Coinbase Global Inc.", nameCN: "Coinbase" },

  // ===== 金融 =====
  { ticker: "BRK.B", nameEN: "Berkshire Hathaway Inc.", nameCN: "伯克希尔" },
  { ticker: "JPM", nameEN: "JPMorgan Chase & Co.", nameCN: "摩根大通" },
  { ticker: "V", nameEN: "Visa Inc.", nameCN: "维萨" },
  { ticker: "MA", nameEN: "Mastercard Inc.", nameCN: "万事达" },
  { ticker: "BAC", nameEN: "Bank of America Corp.", nameCN: "美国银行" },
  { ticker: "WFC", nameEN: "Wells Fargo & Company", nameCN: "富国银行" },
  { ticker: "GS", nameEN: "Goldman Sachs Group Inc.", nameCN: "高盛" },
  { ticker: "MS", nameEN: "Morgan Stanley", nameCN: "摩根士丹利" },
  { ticker: "C", nameEN: "Citigroup Inc.", nameCN: "花旗" },
  { ticker: "AXP", nameEN: "American Express Company", nameCN: "美国运通" },
  { ticker: "PYPL", nameEN: "PayPal Holdings Inc.", nameCN: "贝宝" },

  // ===== 医疗健康 =====
  { ticker: "UNH", nameEN: "UnitedHealth Group Inc.", nameCN: "联合健康" },
  { ticker: "JNJ", nameEN: "Johnson & Johnson", nameCN: "强生" },
  { ticker: "LLY", nameEN: "Eli Lilly and Company", nameCN: "礼来" },
  { ticker: "ABBV", nameEN: "AbbVie Inc.", nameCN: "艾伯维" },
  { ticker: "MRK", nameEN: "Merck & Co. Inc.", nameCN: "默沙东" },
  { ticker: "PFE", nameEN: "Pfizer Inc.", nameCN: "辉瑞" },
  { ticker: "TMO", nameEN: "Thermo Fisher Scientific", nameCN: "赛默飞" },
  { ticker: "ABT", nameEN: "Abbott Laboratories", nameCN: "雅培" },
  { ticker: "DHR", nameEN: "Danaher Corporation", nameCN: "丹纳赫" },
  { ticker: "BMY", nameEN: "Bristol-Myers Squibb", nameCN: "百时美施贵宝" },
  { ticker: "AMGN", nameEN: "Amgen Inc.", nameCN: "安进" },
  { ticker: "GILD", nameEN: "Gilead Sciences Inc.", nameCN: "吉利德" },
  { ticker: "NVO", nameEN: "Novo Nordisk A/S", nameCN: "诺和诺德" },

  // ===== 消费 =====
  { ticker: "WMT", nameEN: "Walmart Inc.", nameCN: "沃尔玛" },
  { ticker: "PG", nameEN: "Procter & Gamble Company", nameCN: "宝洁" },
  { ticker: "KO", nameEN: "Coca-Cola Company", nameCN: "可口可乐" },
  { ticker: "PEP", nameEN: "PepsiCo Inc.", nameCN: "百事可乐" },
  { ticker: "COST", nameEN: "Costco Wholesale Corp.", nameCN: "好市多" },
  { ticker: "MCD", nameEN: "McDonald's Corporation", nameCN: "麦当劳" },
  { ticker: "SBUX", nameEN: "Starbucks Corporation", nameCN: "星巴克" },
  { ticker: "NKE", nameEN: "Nike Inc.", nameCN: "耐克" },
  { ticker: "DIS", nameEN: "Walt Disney Company", nameCN: "迪士尼" },
  { ticker: "NFLX", nameEN: "Netflix Inc.", nameCN: "奈飞" },
  { ticker: "HD", nameEN: "Home Depot Inc.", nameCN: "家得宝" },
  { ticker: "LOW", nameEN: "Lowe's Companies Inc.", nameCN: "劳氏" },
  { ticker: "TGT", nameEN: "Target Corporation", nameCN: "塔吉特" },

  // ===== 工业 =====
  { ticker: "CAT", nameEN: "Caterpillar Inc.", nameCN: "卡特彼勒" },
  { ticker: "BA", nameEN: "Boeing Company", nameCN: "波音" },
  { ticker: "GE", nameEN: "GE Aerospace", nameCN: "通用电气" },
  { ticker: "HON", nameEN: "Honeywell International", nameCN: "霍尼韦尔" },
  { ticker: "UPS", nameEN: "United Parcel Service", nameCN: "联合包裹" },
  { ticker: "RTX", nameEN: "RTX Corporation", nameCN: "雷神" },
  { ticker: "LMT", nameEN: "Lockheed Martin Corp.", nameCN: "洛克希德马丁" },
  { ticker: "DE", nameEN: "Deere & Company", nameCN: "迪尔" },

  // ===== 能源 =====
  { ticker: "XOM", nameEN: "Exxon Mobil Corporation", nameCN: "埃克森美孚" },
  { ticker: "CVX", nameEN: "Chevron Corporation", nameCN: "雪佛龙" },
  { ticker: "COP", nameEN: "ConocoPhillips", nameCN: "康菲石油" },

  // ===== 通信 =====
  { ticker: "T", nameEN: "AT&T Inc.", nameCN: "AT&T" },
  { ticker: "VZ", nameEN: "Verizon Communications", nameCN: "威瑞森" },
  { ticker: "TMUS", nameEN: "T-Mobile US Inc.", nameCN: "T-Mobile" },
  { ticker: "CMCSA", nameEN: "Comcast Corporation", nameCN: "康卡斯特" },

  // ===== 中概股 =====
  { ticker: "BABA", nameEN: "Alibaba Group Holding", nameCN: "阿里巴巴" },
  { ticker: "PDD", nameEN: "PDD Holdings Inc.", nameCN: "拼多多" },
  { ticker: "JD", nameEN: "JD.com Inc.", nameCN: "京东" },
  { ticker: "BIDU", nameEN: "Baidu Inc.", nameCN: "百度" },
  { ticker: "NIO", nameEN: "NIO Inc.", nameCN: "蔚来" },
  { ticker: "XPEV", nameEN: "XPeng Inc.", nameCN: "小鹏汽车" },
  { ticker: "LI", nameEN: "Li Auto Inc.", nameCN: "理想汽车" },
  { ticker: "BILI", nameEN: "Bilibili Inc.", nameCN: "哔哩哔哩" },
  { ticker: "TME", nameEN: "Tencent Music Entertainment", nameCN: "腾讯音乐" },
  { ticker: "ZH", nameEN: "Zhihu Inc.", nameCN: "知乎" },
  { ticker: "FUTU", nameEN: "Futu Holdings Limited", nameCN: "富途" },
  { ticker: "TIGR", nameEN: "UP Fintech Holding", nameCN: "老虎证券" },

  // ===== 港股 =====
  { ticker: "9992.HK", nameEN: "Pop Mart International Group Ltd.", nameCN: "泡泡玛特" },
  { ticker: "0175.HK", nameEN: "Geely Automobile Holdings Ltd.", nameCN: "吉利汽车" },
  { ticker: "1816.HK", nameEN: "CGN Power Co. Ltd.", nameCN: "中广核电力" },

  // ===== A股 =====
  { ticker: "600519.SS", nameEN: "Kweichow Moutai Co. Ltd.", nameCN: "贵州茅台" },
];

async function main() {
  console.log("🌱 开始导入股票中文名称映射...");

  let created = 0;
  let skipped = 0;

  for (const stock of STOCK_NAMES) {
    const existing = await prisma.stockNameCN.findUnique({
      where: { ticker: stock.ticker },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.stockNameCN.create({
      data: {
        ticker: stock.ticker,
        nameEN: stock.nameEN,
        nameCN: stock.nameCN,
        source: "seed",
      },
    });
    created++;
  }

  console.log(
    `✅ 完成！新增 ${created} 条，跳过 ${skipped} 条（已存在），共 ${STOCK_NAMES.length} 条。`,
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
