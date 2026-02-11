export default function AnalysisPage() {
  return (
    <main className="workspace" style={{ gridTemplateColumns: "1fr" }}>
      <section className="data-panel">
        <div className="section-header">
          <span className="label">投资组合分析</span>
          <span className="label text-mono">即将上线</span>
        </div>
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-tertiary)" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px" }}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <p style={{ fontFamily: "var(--font-family-serif)", fontSize: 20 }}>
            资产分析功能开发中
          </p>
          <p style={{ marginTop: 8, fontSize: 14 }}>
            此页面将展示投资组合的深度分析、风险评估与历史表现
          </p>
        </div>
      </section>
    </main>
  );
}
