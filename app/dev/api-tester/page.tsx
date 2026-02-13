"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import { API_ENDPOINTS, groupEndpoints, type ApiEndpoint } from "@/lib/api-registry";

/* ===== 类型 ===== */
interface HistoryEntry {
  id: string;
  ts: number;
  name: string;
  method: string;
  url: string;
  status: number;
  time: number;
  body: string;
}

/* ===== 常量 ===== */
const STORAGE_KEY = "api-tester-history";
const MAX_HISTORY = 50;

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET:    { bg: "#ECFDF5", text: "#059669" },
  POST:   { bg: "#EFF6FF", text: "#2563EB" },
  PUT:    { bg: "#FFFBEB", text: "#D97706" },
  DELETE: { bg: "#FEF2F2", text: "#DC2626" },
  PATCH:  { bg: "#F5F3FF", text: "#7C3AED" },
};

const STATUS_COLOR = (s: number) =>
  s < 300 ? "#059669" : s < 500 ? "#D97706" : "#DC2626";

/* ===== 页面 ===== */
export default function ApiTesterPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const groups = groupEndpoints();

  /* ---- state ---- */
  const [selected, setSelected] = useState(0);
  const [params, setParams] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<{ status: number; time: number; body: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const api = API_ENDPOINTS[selected];

  /* 加载历史 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  /* 切换 API 时重置表单 */
  useEffect(() => {
    const defaults: Record<string, string> = {};
    api.params.forEach((p) => {
      if (p.default) defaults[p.key] = p.default;
    });
    setParams(defaults);
    setBodyText(api.bodyExample ?? "");
    setResp(null);
  }, [selected, api]);

  /* 构建 URL */
  const buildUrl = useCallback(() => {
    let url = api.path;
    const query: string[] = [];

    api.params.forEach((p) => {
      const v = params[p.key] ?? "";
      if (p.in === "path") {
        url = url.replace(`{${p.key}}`, encodeURIComponent(v));
      } else if (p.in === "query" && v) {
        query.push(`${encodeURIComponent(p.key)}=${encodeURIComponent(v)}`);
      }
    });

    return query.length ? `${url}?${query.join("&")}` : url;
  }, [api, params]);

  /* 发送请求 */
  const send = async () => {
    setLoading(true);
    setResp(null);
    const url = buildUrl();
    const t0 = performance.now();

    try {
      const opts: RequestInit = { method: api.method };
      if (api.method !== "GET" && bodyText.trim()) {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = bodyText;
      }
      const res = await fetch(url, opts);
      const elapsed = Math.round(performance.now() - t0);
      let body: string;
      try {
        body = JSON.stringify(await res.json(), null, 2);
      } catch {
        body = await res.text();
      }
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        ts: Date.now(),
        name: api.name,
        method: api.method,
        url,
        status: res.status,
        time: elapsed,
        body,
      };
      setResp({ status: res.status, time: elapsed, body });

      /* 保存历史 */
      const next = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(next);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setResp({ status: 0, time: Math.round(performance.now() - t0), body: `网络错误: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  /* 回填历史 */
  const replayHistory = (h: HistoryEntry) => {
    setResp({ status: h.status, time: h.time, body: h.body });
  };

  /* ---- 渲染 ---- */
  return (
    <div style={S.root}>
      {/* ====== 侧栏 ====== */}
      <aside style={S.sidebar}>
        <h2 style={S.sidebarTitle}>API Tester</h2>

        {Object.entries(groups).map(([group, endpoints]) => (
          <div key={group} style={{ marginBottom: 16 }}>
            <div style={S.groupLabel}>{group}</div>
            {endpoints.map((ep) => {
              const idx = API_ENDPOINTS.indexOf(ep);
              const isActive = idx === selected;
              const mc = METHOD_COLORS[ep.method] ?? METHOD_COLORS.GET;
              return (
                <button key={idx} onClick={() => setSelected(idx)} style={{ ...S.apiItem, ...(isActive ? S.apiItemActive : {}) }}>
                  <span style={{ ...S.methodBadge, background: mc.bg, color: mc.text }}>{ep.method}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{ep.name}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* 历史 */}
        <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
          <button onClick={() => setShowHistory(!showHistory)} style={S.historyToggle}>
            📋 历史记录 ({history.length})
            <span style={{ transform: showHistory ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
          </button>
          {showHistory && (
            <div style={S.historyList}>
              {history.length === 0 && <div style={{ padding: "12px 0", color: "var(--text-tertiary)", fontSize: 13 }}>暂无记录</div>}
              {history.map((h) => (
                <button key={h.id} onClick={() => replayHistory(h)} style={S.historyItem}>
                  <span style={{ ...S.methodBadgeSm, background: METHOD_COLORS[h.method]?.bg, color: METHOD_COLORS[h.method]?.text }}>{h.method}</span>
                  <span style={{ flex: 1, textAlign: "left", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</span>
                  <span style={{ fontSize: 11, color: STATUS_COLOR(h.status) }}>{h.status}</span>
                </button>
              ))}
              {history.length > 0 && (
                <button onClick={clearHistory} style={S.clearBtn}>清空历史</button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ====== 主区域 ====== */}
      <main style={S.main}>
        {/* 标题 */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={S.apiName}>{api.name}</h3>
          {api.description && <p style={S.apiDesc}>{api.description}</p>}
        </div>

        {/* URL 栏 */}
        <div style={S.urlBar}>
          <span style={{ ...S.methodBadge, background: METHOD_COLORS[api.method]?.bg, color: METHOD_COLORS[api.method]?.text }}>{api.method}</span>
          <code style={S.urlText}>{buildUrl()}</code>
        </div>

        {/* 参数表单 */}
        {api.params.length > 0 && (
          <div style={S.section}>
            <h4 style={S.sectionTitle}>参数</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {api.params.filter((p) => p.in !== "body").map((p) => (
                <div key={p.key} style={S.paramRow}>
                  <label style={S.paramLabel}>
                    {p.key} {p.required && <span style={{ color: "#DC2626" }}>*</span>}
                    <span style={S.paramType}>{p.in}</span>
                  </label>
                  {p.description && <span style={S.paramDesc}>{p.description}</span>}
                  <input
                    style={S.input}
                    value={params[p.key] ?? ""}
                    placeholder={p.placeholder}
                    onChange={(e) => setParams({ ...params, [p.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        {api.params.some((p) => p.in === "body") && (
          <div style={S.section}>
            <h4 style={S.sectionTitle}>请求体 (JSON)</h4>
            <textarea
              style={S.textarea}
              rows={8}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder='{ "key": "value" }'
              spellCheck={false}
            />
          </div>
        )}

        {/* 发送按钮 */}
        <button onClick={send} disabled={loading} style={{ ...S.sendBtn, opacity: loading ? 0.6 : 1 }}>
          {loading ? "请求中..." : "▶ 发送请求"}
        </button>

        {/* 响应 */}
        {resp && (
          <div style={S.section}>
            <div style={S.respHeader}>
              <span style={{ ...S.statusBadge, background: `${STATUS_COLOR(resp.status)}15`, color: STATUS_COLOR(resp.status) }}>
                {resp.status === 0 ? "ERR" : resp.status}
              </span>
              <span style={S.respTime}>{resp.time} ms</span>
            </div>
            <pre style={S.respBody}>{resp.body}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

/* ===== 样式 ===== */
const S: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    borderRadius: "24px 24px 0 0",
    background: "var(--bg-surface)",
    boxShadow: "0 -10px 40px rgba(0,0,0,.05)",
    minHeight: 0,
  },
  /* 侧栏 */
  sidebar: {
    width: 260,
    borderRight: "1px solid var(--border-light)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    overflowY: "auto",
    flexShrink: 0,
  },
  sidebarTitle: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: 24,
    color: "var(--text-primary)",
  },
  groupLabel: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "var(--text-tertiary)",
    padding: "4px 8px",
    marginBottom: 4,
  },
  apiItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "8px 8px",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    cursor: "pointer",
    fontFamily: "var(--font-family-mono)",
    fontSize: 13,
    color: "var(--text-secondary)",
    transition: "background .15s",
  },
  apiItemActive: {
    background: "rgba(79,70,229,.06)",
    color: "var(--text-primary)",
    fontWeight: 500,
  },
  methodBadge: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 4,
    letterSpacing: "0.04em",
    flexShrink: 0,
  },
  methodBadgeSm: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 9,
    fontWeight: 700,
    padding: "1px 4px",
    borderRadius: 3,
    flexShrink: 0,
  },
  /* 历史 */
  historyToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "var(--font-family-mono)",
    fontSize: 12,
    color: "var(--text-secondary)",
    padding: "4px 8px",
  },
  historyList: { display: "flex", flexDirection: "column", gap: 2, marginTop: 8, maxHeight: 240, overflowY: "auto" },
  historyItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
    padding: "6px 8px",
    border: "none",
    borderRadius: 6,
    background: "transparent",
    cursor: "pointer",
    fontFamily: "var(--font-family-mono)",
    transition: "background .15s",
  },
  clearBtn: {
    marginTop: 8,
    border: "none",
    background: "transparent",
    color: "#DC2626",
    cursor: "pointer",
    fontFamily: "var(--font-family-mono)",
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 4,
  },
  /* 主区域 */
  main: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: 32,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  apiName: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 20,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  apiDesc: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 13,
    color: "var(--text-tertiary)",
    marginTop: 4,
  },
  urlBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
    background: "#F9FAFB",
    border: "1px solid var(--border-light)",
  },
  urlText: { fontFamily: "var(--font-family-mono)", fontSize: 13, color: "var(--text-primary)", wordBreak: "break-all" },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionTitle: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-tertiary)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  paramRow: { display: "flex", flexDirection: "column", gap: 4 },
  paramLabel: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  paramType: {
    fontSize: 10,
    padding: "1px 5px",
    borderRadius: 4,
    background: "#F3F4F6",
    color: "var(--text-tertiary)",
    fontWeight: 500,
  },
  paramDesc: { fontFamily: "var(--font-family-mono)", fontSize: 11, color: "var(--text-tertiary)" },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid var(--border-light)",
    borderRadius: 8,
    fontFamily: "var(--font-family-mono)",
    fontSize: 13,
    color: "var(--text-primary)",
    outline: "none",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--border-light)",
    borderRadius: 8,
    fontFamily: "var(--font-family-mono)",
    fontSize: 13,
    color: "var(--text-primary)",
    outline: "none",
    resize: "vertical" as const,
    background: "#fff",
  },
  sendBtn: {
    alignSelf: "flex-start",
    padding: "10px 24px",
    borderRadius: 10,
    border: "none",
    background: "var(--text-primary)",
    color: "#fff",
    fontFamily: "var(--font-family-mono)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.04em",
    transition: "opacity .15s",
  },
  respHeader: { display: "flex", alignItems: "center", gap: 12 },
  statusBadge: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 13,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 6,
  },
  respTime: { fontFamily: "var(--font-family-mono)", fontSize: 12, color: "var(--text-tertiary)" },
  respBody: {
    fontFamily: "var(--font-family-mono)",
    fontSize: 12,
    lineHeight: 1.6,
    background: "#F9FAFB",
    padding: 16,
    borderRadius: 10,
    border: "1px solid var(--border-light)",
    overflow: "auto",
    maxHeight: 400,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    color: "var(--text-primary)",
  },
};
