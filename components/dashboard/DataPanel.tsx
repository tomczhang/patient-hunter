import type { Holding } from "@/types";
import { cn } from "@/lib/utils";

const holdings: Holding[] = [
  {
    name: "苹果公司",
    ticker: "AAPL • NASDAQ",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    ringGradient: "conic-gradient(var(--accent-purple) 0% 85%, #F3F4F6 85% 100%)",
    price: "$173.50",
    delta: "+1.2%",
    deltaType: "pos",
    totalValue: "$142,320",
  },
  {
    name: "先锋全股市指数",
    ticker: "VTI • ETF",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    iconColor: "var(--accent-purple)",
    ringGradient: "conic-gradient(var(--accent-yellow) 0% 60%, #F3F4F6 60% 100%)",
    price: "$228.42",
    delta: "+0.4%",
    deltaType: "pos",
    totalValue: "$89,450",
  },
  {
    name: "高收益储蓄",
    ticker: "ALLY • CASH",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    iconColor: "var(--text-primary)",
    ringGradient: "conic-gradient(var(--text-primary) 0% 25%, #F3F4F6 25% 100%)",
    price: "$1.00",
    delta: "0.0%",
    deltaType: "neutral",
    totalValue: "$50,000",
  },
  {
    name: "特斯拉",
    ticker: "TSLA • NASDAQ",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    ringGradient: "conic-gradient(var(--accent-purple) 0% 15%, #F3F4F6 15% 100%)",
    price: "$242.10",
    delta: "-1.5%",
    deltaType: "neg",
    totalValue: "$24,210",
  },
];

export default function DataPanel() {
  return (
    <section className="data-panel">
      <div className="section-header">
        <span className="label">持仓资产</span>
        <span className="label text-mono">更新于 9:41</span>
      </div>

      <table className="table-grid">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>资产</th>
            <th style={{ width: "15%" }}>权重</th>
            <th style={{ width: "20%" }} className="text-right">价格</th>
            <th style={{ width: "25%" }} className="text-right">总价值</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.ticker}>
              <td>
                <div className="row-flex">
                  <div
                    className="icon-hex"
                    style={h.iconColor ? { color: h.iconColor } : undefined}
                  >
                    {h.icon}
                  </div>
                  <div>
                    <span className="asset-name">{h.name}</span>
                    <span className="asset-ticker">{h.ticker}</span>
                  </div>
                </div>
              </td>
              <td>
                <div
                  className="mini-ring"
                  style={{ background: h.ringGradient }}
                />
              </td>
              <td className="text-right">
                <div className="asset-amount">{h.price}</div>
                <div
                  className={cn(
                    "delta",
                    h.deltaType === "pos" && "pos",
                    h.deltaType === "neg" && "neg"
                  )}
                  style={{
                    fontSize: 12,
                    justifyContent: "flex-end",
                    ...(h.deltaType === "neutral" ? { color: "var(--text-tertiary)" } : {}),
                  }}
                >
                  {h.delta}
                </div>
              </td>
              <td className="text-right">
                <div className="asset-amount" style={{ fontSize: 16, fontWeight: 600 }}>
                  {h.totalValue}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
