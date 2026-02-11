"use client";

import { useState } from "react";
import TabsRow from "@/components/dashboard/TabsRow";
import SummaryPanel from "@/components/dashboard/SummaryPanel";
import DataPanel from "@/components/dashboard/DataPanel";
import AssetPanel from "@/components/dashboard/AssetPanel";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <TabsRow activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="workspace">
        {activeTab === 0 && (
          <>
            <SummaryPanel />
            <DataPanel />
          </>
        )}
        {activeTab === 2 && <AssetPanel />}
        {(activeTab === 1 || activeTab === 3) && (
          <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center", color: "var(--text-tertiary)" }}>
            功能开发中…
          </div>
        )}
      </main>
    </>
  );
}
