"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import AddAssetForm from "./AddAssetForm";
import ScreenshotUpload from "./ScreenshotUpload";
import { cn } from "@/lib/utils";

type TabId = "screenshot" | "form";

interface AddAssetModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddAssetModal({ open, onClose }: AddAssetModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("screenshot");

  const tabs: { id: TabId; label: string }[] = [
    { id: "screenshot", label: "上传截图" },
    { id: "form", label: "填写表单" },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      {/* 标题 */}
      <h2 className="section-title" style={{ marginBottom: 16, fontFamily: "var(--font-family-mono)" }}>新增资产</h2>

      {/* Tab 切换 */}
      <div className="modal-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={cn("modal-tab", activeTab === t.id && "active")}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {activeTab === "screenshot" && <ScreenshotUpload onClose={onClose} />}
      {activeTab === "form" && <AddAssetForm onCancel={onClose} />}
    </Modal>
  );
}
