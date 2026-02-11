"use client";

import { useState } from "react";
import { PORTFOLIO_TABS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function TabsRow() {
  const [active, setActive] = useState(0);

  return (
    <div className="tabs-row">
      {PORTFOLIO_TABS.map((label, i) => (
        <div
          key={label}
          className={cn("tab", i === active && "active")}
          onClick={() => setActive(i)}
        >
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
