"use client";

import { useState } from "react";
import type { Asset } from "@/types";
import AddAssetModal from "./AddAssetModal";

const BAR_HEIGHTS = [40, 55, 45, 70, 65, 85, 75, 90, 80, 95];

const assets: Asset[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    category: "科技",
    subcategory: "Equities",
    allocation: 42,
    value: "$353,762.40",
    performance: "+18.2%",
    performanceType: "up",
  },
  {
    ticker: "VOO",
    name: "Vanguard S&P 500",
    category: "指数基金",
    subcategory: "ETF",
    allocation: 35,
    value: "$294,802.02",
    performance: "+11.4%",
    performanceType: "up",
  },
  {
    ticker: "CASH",
    name: "Chase Savings",
    category: "流动资金",
    subcategory: "Cash",
    allocation: 23,
    value: "$193,727.08",
    performance: "--",
    performanceType: "neutral",
  },
];

export default function AssetPanel() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="asset-panel-root">
      <div className="dashboard-grid">
        {/* 摘要卡片 */}
        <div className="card summary-block">
          <span className="label">总净资产</span>
          <div className="value-large">$842,291.50</div>
          <div className="trend up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
            今年 +12.4%
          </div>
        </div>

        {/* 柱状图 */}
        <div className="card chart-block">
          <div className="chart-block-label">
            <span className="label">投资组合表现</span>
          </div>
          {BAR_HEIGHTS.map((h, i) => (
            <div key={i} className="bar" style={{ height: `${h}%` }} />
          ))}
        </div>

        {/* 资产配置表格 */}
        <div className="assets-table-container">
          <div className="section-header">
            <h2 className="section-title">资产配置</h2>
            <button className="btn-add" onClick={() => setShowModal(true)}>
              + 添加资产
            </button>
          </div>
          <table className="asset-table">
            <thead>
              <tr>
                <th>资产名称</th>
                <th>类别</th>
                <th>分配比例</th>
                <th>当前价值</th>
                <th>表现</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.ticker}>
                  <td>
                    <div className="asset-info">
                      <div className="asset-icon">{a.ticker}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{a.subcategory}</div>
                      </div>
                    </div>
                  </td>
                  <td>{a.category}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="allocation-pill">
                        <div className="allocation-fill" style={{ width: `${a.allocation}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{a.allocation}%</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{a.value}</td>
                  <td>
                    {a.performanceType === "up" ? (
                      <span className="trend up">{a.performance}</span>
                    ) : (
                      <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{a.performance}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加资产弹窗 */}
      <AddAssetModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
