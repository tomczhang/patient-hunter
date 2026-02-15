"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ImageParseOutput } from "@/lib/ai/image-pipeline/types";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

/** 阶段性进度文字 */
type LoadingStage =
  | "uploading"   // 上传图片中
  | "parsing"     // AI 解析中
  | "searching"   // 查找股票信息中
  | "idle";

const STAGE_TEXT: Record<LoadingStage, string> = {
  uploading: "正在上传图片…",
  parsing: "AI 正在解析中…",
  searching: "正在查找股票信息…",
  idle: "",
};

const TIMEOUT_HINT = "仍在处理中，请耐心等待…";
const TIMEOUT_MS = 10_000;

interface ChatInputProps {
  /** 外部注入的文本（来自 FeatureBar） */
  injectedText: string | null;
  onInjectedTextConsumed: () => void;
  /** 解析完成回调 */
  onParseResult: (result: ImageParseOutput) => void;
  /** 解析出错回调 */
  onParseError: (error: string) => void;
}

export default function ChatInput({
  injectedText,
  onInjectedTextConsumed,
  onParseResult,
  onParseError,
}: ChatInputProps) {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<LoadingStage>("idle");
  const [showTimeout, setShowTimeout] = useState(false);
  const [text, setText] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- 处理外部注入文本 ---- */
  useEffect(() => {
    if (injectedText) {
      setText((prev) => (prev ? `${prev}\n${injectedText}` : injectedText));
      onInjectedTextConsumed();
      setTimeout(() => {
        textareaRef.current?.focus();
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
      }, 0);
    }
  }, [injectedText, onInjectedTextConsumed]);

  /* ---- Auto-resize textarea ---- */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  /* ---- 图片处理 ---- */
  const addImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages((prev) => [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, file, preview: e.target?.result as string },
      ]);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) Array.from(files).forEach(addImage);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---- 拖拽上传 ---- */
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) Array.from(files).forEach(addImage);
  }, [addImage]);

  /* ---- 上传图片到后端获取 Base64 ---- */
  const uploadImage = async (file: File, signal: AbortSignal): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData, signal });
    if (!res.ok) throw new Error("图片上传失败");
    const data = await res.json();
    return data.base64;
  };

  /* ---- 取消处理 ---- */
  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoading(false);
    setStage("idle");
    setShowTimeout(false);
  }, []);

  /* ---- 发送逻辑 ---- */
  const canSend = !loading && (text.trim().length > 0 || images.length > 0);

  const handleSend = async () => {
    if (!canSend) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setShowTimeout(false);

    // 10 秒后显示超时提示
    timeoutRef.current = setTimeout(() => setShowTimeout(true), TIMEOUT_MS);

    const hasText = text.trim().length > 0;
    const hasImages = images.length > 0;

    try {
      let result: ImageParseOutput;

      if (hasImages) {
        // Stage 1: 上传图片
        setStage("uploading");
        const base64 = await uploadImage(images[0].file, controller.signal);

        // Stage 2: AI 解析（含 enrichment）
        setStage("parsing");
        const res = await fetch("/api/ai/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            ...(hasText ? { context: text.trim() } : {}),
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error((await res.json()).error || "解析失败");
        result = await res.json();
      } else {
        // 纯文本 → Agent 解析（含 tool calling 查找股票）
        setStage("parsing");
        const res = await fetch("/api/ai/parse-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim() }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error((await res.json()).error || "解析失败");
        result = await res.json();
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStage("idle");
      setShowTimeout(false);
      setText("");
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onParseResult(result);
    } catch (e: unknown) {
      if ((e as Error).name === "AbortError") return; // 用户取消
      const message = e instanceof Error ? e.message : "解析失败，请重试";
      onParseError(message);
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      abortRef.current = null;
      setLoading(false);
      setStage("idle");
      setShowTimeout(false);
    }
  };

  /* ---- 快捷键 Ctrl/Cmd + Enter 发送 ---- */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn("chat-input-wrapper", isDragging && "dragging")}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ===== Loading 遮罩 ===== */}
      {loading && (
        <div className="chat-loading-overlay">
          <div className="chat-loading-content">
            <span className="chat-pulse-dots">
              <span />
              <span />
              <span />
            </span>
            <p className="chat-loading-text">
              {showTimeout ? TIMEOUT_HINT : STAGE_TEXT[stage]}
            </p>
            <button className="chat-cancel-btn" onClick={handleCancel}>
              取消
            </button>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="chat-textarea"
        placeholder="描述你的交易或持仓信息，也可以上传截图…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        rows={2}
      />

      {/* 图片缩略图预览 */}
      {images.length > 0 && (
        <div className="chat-image-previews">
          {images.map((img) => (
            <div key={img.id} className="chat-image-thumb">
              <img src={img.preview} alt="预览" />
              <button
                className="chat-image-remove"
                onClick={() => removeImage(img.id)}
                aria-label="删除"
                disabled={loading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 底部工具栏 */}
      <div className="chat-toolbar">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          className="chat-tool-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          aria-label="上传图片"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        <button
          className={cn("chat-send-btn", !canSend && "disabled")}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="发送"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
