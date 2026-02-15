"use client";

import { useState } from "react";
import { RISK_CATEGORIES, CURRENCIES } from "@/lib/constants";
import type {
  ImageParseOutput,
  TradeParseResult,
  PositionParseResult,
} from "@/lib/ai/image-pipeline/types";
import type { ImageType } from "@/lib/ai/image-pipeline/types";

/* ---- 可编辑行类型 ---- */

interface TradeRow {
  _key: string;
  action: "buy" | "sell";
  ticker: string;
  name: string;
  quantity: string;
  price: string;
  currency: string;
  tradedAt: string;
}

interface PositionRow {
  _key: string;
  ticker: string;
  name: string;
  quantity: string;
  costPrice: string;
  currency: string;
}

/* ---- Props ---- */

interface AssetConfirmTableProps {
  result: ImageParseOutput;
  onConfirm: (data: { type: ImageType; rows: (TradeRow | PositionRow)[]; riskCategory: string }) => void;
  onRetry: () => void;
}

/* ---- 工具函数 ---- */

function toTradeRows(data: TradeParseResult): TradeRow[] {
  return data.trades.map((t, i) => ({
    _key: `trade-${i}-${Date.now()}`,
    action: t.action,
    ticker: t.ticker || "",
    name: t.name || "",
    quantity: t.quantity != null ? String(t.quantity) : "",
    price: t.price != null ? String(t.price) : "",
    currency: t.currency || "",
    tradedAt: isValidDate(t.tradedAt) ? t.tradedAt : getToday(),
  }));
}

function toPositionRows(data: PositionParseResult): PositionRow[] {
  return data.positions.map((p, i) => ({
    _key: `pos-${i}-${Date.now()}`,
    ticker: p.ticker || "",
    name: p.name || "",
    quantity: p.quantity != null ? String(p.quantity) : "",
    costPrice: p.costPrice != null ? String(p.costPrice) : "",
    currency: p.currency || "",
  }));
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 验证日期字符串是否为有效的 YYYY-MM-DD 格式 */
function isValidDate(v: unknown): v is string {
  if (typeof v !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
}

const isMissing = (v: string) => !v || v.trim() === "";

/* ---- 组件 ---- */

export default function AssetConfirmTable({ result, onConfirm, onRetry }: AssetConfirmTableProps) {
  const [riskCategory, setRiskCategory] = useState("aggressive");

  /* 处理 unknown 类型 */
  if (result.type === "unknown") {
    return (
      <div className="confirm-table-section">
        <div className="confirm-unknown">
          <p className="confirm-unknown-text">
            ⚠️ 无法识别为交易或持仓信息
          </p>
          {result.rawText && (
            <pre className="confirm-raw-text">{result.rawText}</pre>
          )}
        </div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onRetry}>重新输入</button>
        </div>
      </div>
    );
  }

  /* 根据 type 初始化行 */
  if (result.type === "trade_record") {
    return (
      <TradeTable
        data={result.data as TradeParseResult}
        riskCategory={riskCategory}
        onRiskChange={setRiskCategory}
        onConfirm={(rows) => onConfirm({ type: result.type, rows, riskCategory })}
        onRetry={onRetry}
      />
    );
  }

  return (
    <PositionTable
      data={result.data as PositionParseResult}
      riskCategory={riskCategory}
      onRiskChange={setRiskCategory}
      onConfirm={(rows) => onConfirm({ type: result.type, rows, riskCategory })}
      onRetry={onRetry}
    />
  );
}

/* ============ 交易记录表格 ============ */

function TradeTable({
  data,
  riskCategory,
  onRiskChange,
  onConfirm,
  onRetry,
}: {
  data: TradeParseResult;
  riskCategory: string;
  onRiskChange: (v: string) => void;
  onConfirm: (rows: TradeRow[]) => void;
  onRetry: () => void;
}) {
  const [rows, setRows] = useState<TradeRow[]>(() => toTradeRows(data));

  const updateRow = (key: string, field: keyof TradeRow, value: string) => {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, [field]: value } : r)));
  };

  const deleteRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r._key !== key));
  };

  const requiredFilled = rows.length > 0 && rows.every(
    (r) => !isMissing(r.ticker) && !isMissing(r.quantity) && !isMissing(r.price),
  );

  return (
    <div className="confirm-table-section">
      <div className="confirm-table-scroll">
        <table className="confirm-table">
          <thead>
            <tr>
              <th className="col-action">操作</th>
              <th className="col-ticker">股票代码</th>
              <th className="col-name">名称</th>
              <th className="col-qty">数量</th>
              <th className="col-price">价格</th>
              <th className="col-currency">币种</th>
              <th className="col-date">日期</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._key}>
                <td>
                  <select className="confirm-cell" value={r.action} onChange={(e) => updateRow(r._key, "action", e.target.value)}>
                    <option value="buy">买入</option>
                    <option value="sell">卖出</option>
                  </select>
                </td>
                <td>
                  <input className={`confirm-cell ${isMissing(r.ticker) ? "cell-missing" : ""}`} value={r.ticker} onChange={(e) => updateRow(r._key, "ticker", e.target.value)} placeholder="请补充" />
                </td>
                <td>
                  <input className="confirm-cell" value={r.name} onChange={(e) => updateRow(r._key, "name", e.target.value)} placeholder="可选" />
                </td>
                <td>
                  <input className={`confirm-cell ${isMissing(r.quantity) ? "cell-missing" : ""}`} type="number" value={r.quantity} onChange={(e) => updateRow(r._key, "quantity", e.target.value)} placeholder="请补充" />
                </td>
                <td>
                  <input className={`confirm-cell ${isMissing(r.price) ? "cell-missing" : ""}`} type="number" value={r.price} onChange={(e) => updateRow(r._key, "price", e.target.value)} placeholder="请补充" />
                </td>
                <td>
                  <select className={`confirm-cell ${isMissing(r.currency) ? "cell-missing" : ""}`} value={r.currency} onChange={(e) => updateRow(r._key, "currency", e.target.value)}>
                    <option value="">请选择</option>
                    {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
                  </select>
                </td>
                <td>
                  <input className="confirm-cell" type="date" value={r.tradedAt} onChange={(e) => updateRow(r._key, "tradedAt", e.target.value)} />
                </td>
                <td>
                  <button className="confirm-row-delete" onClick={() => deleteRow(r._key)} aria-label="删除">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 风险分类 */}
      <div className="confirm-risk">
        <label className="label">风险分类</label>
        <select className="form-input" value={riskCategory} onChange={(e) => onRiskChange(e.target.value)}>
          {RISK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* 操作按钮 */}
      <div className="confirm-actions">
        <button className="btn btn-secondary" onClick={onRetry}>重新输入</button>
        <button
          className="btn btn-primary"
          onClick={() => onConfirm(rows)}
          disabled={!requiredFilled}
          style={!requiredFilled ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
        >
          确认添加到组合
        </button>
      </div>
    </div>
  );
}

/* ============ 持仓表格 ============ */

function PositionTable({
  data,
  riskCategory,
  onRiskChange,
  onConfirm,
  onRetry,
}: {
  data: PositionParseResult;
  riskCategory: string;
  onRiskChange: (v: string) => void;
  onConfirm: (rows: PositionRow[]) => void;
  onRetry: () => void;
}) {
  const [rows, setRows] = useState<PositionRow[]>(() => toPositionRows(data));

  const updateRow = (key: string, field: keyof PositionRow, value: string) => {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, [field]: value } : r)));
  };

  const deleteRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r._key !== key));
  };

  const requiredFilled = rows.length > 0 && rows.every(
    (r) => !isMissing(r.ticker) && !isMissing(r.quantity) && !isMissing(r.costPrice),
  );

  return (
    <div className="confirm-table-section">
      <div className="confirm-table-scroll">
        <table className="confirm-table">
          <thead>
            <tr>
              <th className="col-ticker">股票代码</th>
              <th className="col-name">名称</th>
              <th className="col-qty">持仓数量</th>
              <th className="col-price">成本价</th>
              <th className="col-currency">币种</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._key}>
                <td>
                  <input className={`confirm-cell ${isMissing(r.ticker) ? "cell-missing" : ""}`} value={r.ticker} onChange={(e) => updateRow(r._key, "ticker", e.target.value)} placeholder="请补充" />
                </td>
                <td>
                  <input className="confirm-cell" value={r.name} onChange={(e) => updateRow(r._key, "name", e.target.value)} placeholder="可选" />
                </td>
                <td>
                  <input className={`confirm-cell ${isMissing(r.quantity) ? "cell-missing" : ""}`} type="number" value={r.quantity} onChange={(e) => updateRow(r._key, "quantity", e.target.value)} placeholder="请补充" />
                </td>
                <td>
                  <input className={`confirm-cell ${isMissing(r.costPrice) ? "cell-missing" : ""}`} type="number" value={r.costPrice} onChange={(e) => updateRow(r._key, "costPrice", e.target.value)} placeholder="请补充" />
                </td>
                <td>
                  <select className={`confirm-cell ${isMissing(r.currency) ? "cell-missing" : ""}`} value={r.currency} onChange={(e) => updateRow(r._key, "currency", e.target.value)}>
                    <option value="">请选择</option>
                    {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
                  </select>
                </td>
                <td>
                  <button className="confirm-row-delete" onClick={() => deleteRow(r._key)} aria-label="删除">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 风险分类 */}
      <div className="confirm-risk">
        <label className="label">风险分类</label>
        <select className="form-input" value={riskCategory} onChange={(e) => onRiskChange(e.target.value)}>
          {RISK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* 操作按钮 */}
      <div className="confirm-actions">
        <button className="btn btn-secondary" onClick={onRetry}>重新输入</button>
        <button
          className="btn btn-primary"
          onClick={() => onConfirm(rows)}
          disabled={!requiredFilled}
          style={!requiredFilled ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
        >
          确认添加到组合
        </button>
      </div>
    </div>
  );
}
