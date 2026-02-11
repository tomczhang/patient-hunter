import type { NavItem, LegendItem } from "@/types";

/** 顶部导航 */
export const NAV_ITEMS: NavItem[] = [
  { label: "仪表盘", href: "/" },
  { label: "分析", href: "/analysis" },
  { label: "报告", href: "/reports" },
  { label: "设置", href: "/settings" },
];

/** Portfolio Tab 标签 */
export const PORTFOLIO_TABS = [
  "资产面板",
  "现金流",
  "退休金 (IRA)",
  "关注列表",
];

/** 资产分配图例 */
export const ALLOCATION_LEGEND: LegendItem[] = [
  { color: "c-purple", label: "美股 (45%)" },
  { color: "c-yellow", label: "国际股票 (28%)" },
  { color: "c-black", label: "现金及等价物 (13%)" },
];
