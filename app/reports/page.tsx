export default function ReportsPage() {
  return (
    <main className="workspace" style={{ gridTemplateColumns: "1fr" }}>
      <section className="data-panel">
        <div className="section-header">
          <span className="label">报告</span>
          <span className="label text-mono">即将上线</span>
        </div>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-tertiary)" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px" }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p style={{ fontFamily: "var(--font-family-serif)", fontSize: 20 }}>
            报告功能开发中
          </p>
          <p style={{ marginTop: 8, fontSize: 14 }}>
            此页面将提供月度/季度投资报告生成与下载
          </p>
        </div>
      </section>
    </main>
  );
}
