"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ScreenshotUploadProps {
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ScreenshotUpload({ onClose }: ScreenshotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDelete = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!file) return;
    console.log("截图提交:", { name: file.name, size: file.size, type: file.type });
    onClose();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleInputChange}
      />

      {!preview ? (
        /* 空状态 — 上传区域 */
        <div
          className={cn("upload-dropzone", isDragging && "dragging")}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg
            className="upload-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="upload-hint">点击或拖拽图片到此处</span>
          <span className="upload-formats">支持 JPG、PNG、WEBP 格式</span>
        </div>
      ) : (
        /* 预览状态 */
        <div className="upload-preview">
          <img src={preview} alt="截图预览" />
          <div className="upload-file-info">
            <div className="file-meta">
              <span className="file-name">{file?.name}</span>
              <span className="file-size">{file ? formatFileSize(file.size) : ""}</span>
            </div>
            <button className="btn-delete" onClick={handleDelete} aria-label="删除">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="upload-actions">
        <button className="btn btn-secondary" onClick={onClose}>取消</button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!preview}
          style={!preview ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
        >
          确认提交
        </button>
      </div>
    </>
  );
}
