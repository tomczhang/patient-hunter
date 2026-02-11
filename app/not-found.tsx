import Link from "next/link";

export default function NotFound() {
  return (
    <main className="workspace" style={{ gridTemplateColumns: "1fr" }}>
      <section className="data-panel">
        <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-tertiary)" }}>
          <div style={{ fontFamily: "var(--font-family-number)", fontSize: 72, color: "var(--text-primary)", marginBottom: 16, fontWeight: 600 }}>
            404
          </div>
          <p style={{ fontFamily: "var(--font-family-serif)", fontSize: 20, marginBottom: 24 }}>
            页面未找到
          </p>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--accent-indigo)",
              textDecoration: "none",
            }}
          >
            ← 返回仪表盘
          </Link>
        </div>
      </section>
    </main>
  );
}
