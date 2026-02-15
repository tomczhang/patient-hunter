"use client";

interface FeatureButton {
  label: string;
  prompt: string;
}

const FEATURES: FeatureButton[] = [
  { label: "录入交易", prompt: "我执行了以下交易：\n" },
  { label: "解析持仓", prompt: "请帮我解析以下持仓信息：\n" },
  { label: "批量导入", prompt: "以下是我的多笔交易记录：\n" },
];

interface FeatureBarProps {
  onInject: (text: string) => void;
}

export default function FeatureBar({ onInject }: FeatureBarProps) {
  return (
    <div className="feature-bar">
      {FEATURES.map((f) => (
        <button
          key={f.label}
          className="feature-pill"
          onClick={() => onInject(f.prompt)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
