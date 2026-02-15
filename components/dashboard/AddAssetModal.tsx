"use client";

import { useState, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import FeatureBar from "./FeatureBar";
import ChatInput from "./ChatInput";
import AssetConfirmTable from "./AssetConfirmTable";
import type { ImageParseOutput } from "@/lib/ai/image-pipeline/types";

type Phase = "input" | "result";

interface AddAssetModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddAssetModal({ open, onClose }: AddAssetModalProps) {
  const [phase, setPhase] = useState<Phase>("input");
  const [injectedText, setInjectedText] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ImageParseOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ---- FeatureBar → inject ---- */
  const handleInject = useCallback((text: string) => {
    setInjectedText(text);
  }, []);

  /* ---- ChatInput → 解析成功 ---- */
  const handleParseResult = useCallback((result: ImageParseOutput) => {
    setParseResult(result);
    setErrorMsg(null);
    setPhase("result");
  }, []);

  /* ---- ChatInput → 解析失败 ---- */
  const handleParseError = useCallback((error: string) => {
    setErrorMsg(error);
  }, []);

  /* ---- AssetConfirmTable → 确认 ---- */
  const handleConfirm = useCallback((data: unknown) => {
    console.log("确认添加资产:", data);
    setPhase("input");
    setParseResult(null);
    setErrorMsg(null);
    onClose();
  }, [onClose]);

  /* ---- AssetConfirmTable → 重新输入 ---- */
  const handleRetry = useCallback(() => {
    setPhase("input");
    setParseResult(null);
    setErrorMsg(null);
  }, []);

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="section-title" style={{ marginBottom: 16, fontFamily: "var(--font-family-mono)" }}>
        新增资产
      </h2>

      {/* 输入态 */}
      {phase === "input" && (
        <>
          <FeatureBar onInject={handleInject} />

          <ChatInput
            injectedText={injectedText}
            onInjectedTextConsumed={() => setInjectedText(null)}
            onParseResult={handleParseResult}
            onParseError={handleParseError}
          />

          {errorMsg && (
            <div className="chat-error">{errorMsg}</div>
          )}
        </>
      )}

      {/* 结果态 */}
      {phase === "result" && parseResult && (
        <AssetConfirmTable
          result={parseResult}
          onConfirm={handleConfirm}
          onRetry={handleRetry}
        />
      )}
    </Modal>
  );
}
