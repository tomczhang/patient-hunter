import { ALLOCATION_LEGEND } from "@/lib/constants";

export default function SummaryPanel() {
  return (
    <aside className="summary-panel">
      {/* 总净资产 */}
      <div className="kpi-group">
        <span className="label">总净资产</span>
        <div className="kpi-inline">
          <div className="big-number">$1,248,320.00</div>
          <div className="delta pos">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            +$4,231.50 (0.34%)
          </div>
        </div>
      </div>

      {/* 年化收益 */}
      <div className="kpi-group" style={{ marginTop: 20 }}>
        <span className="label">年化收益率</span>
        <div className="sub-number">+12.4%</div>
      </div>

      {/* 资产配置 */}
      <div className="kpi-group">
        <span className="label">资产配置</span>
        <div className="allocation-viz">
          <div className="ring-chart" />
        </div>
        <div className="chart-legend">
          {ALLOCATION_LEGEND.map((item) => (
            <div key={item.label} className="legend-item">
              <div className={`dot ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
