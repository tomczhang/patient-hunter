"use client";

import { PORTFOLIO_TABS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TabsRowProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

export default function TabsRow({ activeTab, onTabChange }: TabsRowProps) {
  return (
    <div className="tabs-row">
      {PORTFOLIO_TABS.map((label, i) => (
        <div
          key={label}
          className={cn("tab", i === activeTab && "active")}
          onClick={() => onTabChange(i)}
        >
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
