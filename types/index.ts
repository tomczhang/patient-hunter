/** 导航项 */
export interface NavItem {
  label: string;
  href: string;
}

/** 持仓资产 */
export interface Holding {
  name: string;
  ticker: string;
  icon: React.ReactNode;
  iconColor?: string;
  ringGradient: string;
  price: string;
  delta: string;
  deltaType: "pos" | "neg" | "neutral";
  totalValue: string;
}

/** 图例项 */
export interface LegendItem {
  color: string;
  label: string;
}
