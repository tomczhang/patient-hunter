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

/** 资产配置项 */
export interface Asset {
  ticker: string;
  name: string;
  category: string;
  subcategory: string;
  allocation: number;
  value: string;
  performance: string;
  performanceType: "up" | "neutral";
}

/** 资产类型选项（添加资产表单用） */
export interface AssetTypeOption {
  id: string;
  label: string;
  icon: string; // SVG path d attribute
}
