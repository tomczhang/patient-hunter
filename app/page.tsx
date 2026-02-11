import TabsRow from "@/components/dashboard/TabsRow";
import SummaryPanel from "@/components/dashboard/SummaryPanel";
import DataPanel from "@/components/dashboard/DataPanel";

export default function DashboardPage() {
  return (
    <>
      <TabsRow />
      <main className="workspace">
        <SummaryPanel />
        <DataPanel />
      </main>
    </>
  );
}
