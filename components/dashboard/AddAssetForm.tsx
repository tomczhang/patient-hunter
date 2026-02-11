"use client";

import { useState, useMemo } from "react";
import { RISK_CATEGORIES, CURRENCIES, MOCK_STOCKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StockItem {
  ticker: string;
  name: string;
  exchange: string;
}

interface AddAssetFormProps {
  onCancel: () => void;
}

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AddAssetForm({ onCancel }: AddAssetFormProps) {
  /* ---- 搜索 & 选股 ---- */
  const [searchText, setSearchText] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredStocks = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.toLowerCase();
    return MOCK_STOCKS.filter(
      (s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
  }, [searchText]);

  /* ---- 表单字段 ---- */
  const [riskCategory, setRiskCategory] = useState("aggressive");
  const [currency, setCurrency] = useState("USD");
  const [purchaseDate, setPurchaseDate] = useState(getToday);
  const [quantity, setQuantity] = useState("");
  const [pricePerShare, setPricePerShare] = useState("");

  const currencySymbol = currency === "CNY" ? "¥" : currency === "HKD" ? "HK$" : "$";

  const totalCost =
    quantity && pricePerShare
      ? `${currencySymbol}${(parseFloat(quantity) * parseFloat(pricePerShare)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${currencySymbol}0.00`;

  /* ---- 选中股票 ---- */
  const handleSelectStock = (stock: StockItem) => {
    setSelectedStock(stock);
    setSearchText("");
    setShowDropdown(false);
  };

  const handleClearStock = () => {
    setSelectedStock(null);
    setSearchText("");
  };

  /* ---- 提交 ---- */
  const handleSubmit = () => {
    if (!selectedStock) return;
    console.log("添加资产:", {
      stock: selectedStock,
      riskCategory,
      currency,
      purchaseDate,
      quantity,
      pricePerShare,
      totalCost,
    });
    onCancel();
  };

  return (
    <>
      {/* Ticker 搜索 */}
      <div className="form-group full-width" style={{ position: "relative" }}>
        <label className="label">搜索股票</label>
        <div className="search-wrapper">
          <input
            type="text"
            className="form-input"
            placeholder="按名称或代码搜索（如 AAPL、腾讯）…"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        {/* 搜索下拉 */}
        {showDropdown && filteredStocks.length > 0 && (
          <div className="search-dropdown">
            {filteredStocks.map((s) => (
              <div
                key={s.ticker}
                className="search-dropdown-item"
                onClick={() => handleSelectStock(s)}
              >
                <span className="ticker-chip">{s.ticker}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{s.exchange}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 选中的股票预览 */}
      {selectedStock && (
        <div className="ticker-preview">
          <span className="ticker-chip">{selectedStock.ticker}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedStock.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{selectedStock.exchange}</div>
          </div>
          <button className="btn-clear-stock" onClick={handleClearStock} aria-label="清除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* 选中股票后才显示表单字段 */}
      {selectedStock && (
        <>
          <div className="form-grid">
            <div className="form-group">
              <label className="label">风险偏好</label>
              <select className="form-input" value={riskCategory} onChange={(e) => setRiskCategory(e.target.value)}>
                {RISK_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">币种</label>
              <select className="form-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">购入日期</label>
              <input
                type="date"
                className="form-input"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">数量</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">每股价格</label>
              <input
                type="text"
                className="form-input"
                placeholder={`${currencySymbol}0.00`}
                value={pricePerShare}
                onChange={(e) => setPricePerShare(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">总成本</label>
              <input
                type="text"
                className="form-input"
                value={totalCost}
                disabled
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onCancel}>放弃草稿</button>
            <button className="btn btn-primary" onClick={handleSubmit}>添加到组合</button>
          </div>
        </>
      )}

      {/* 未选中股票时的底部按钮 */}
      {!selectedStock && (
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onCancel}>放弃草稿</button>
          <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>添加到组合</button>
        </div>
      )}
    </>
  );
}
