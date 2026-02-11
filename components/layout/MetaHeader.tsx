"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function MetaHeader() {
  const pathname = usePathname();

  return (
    <header className="meta-header">
      <div className="brand">耐心猎人</div>
      <nav className="meta-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(pathname === item.href && "active")}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="user">J. Doe</div>
    </header>
  );
}
