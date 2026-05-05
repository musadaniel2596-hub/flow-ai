"use client";

import { useRef, useState, useCallback } from "react";

interface CameraUploadProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export default function CameraUpload({
  onImageSelected,
  isLoading,
}: CameraUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (PNG, JPG, WEBP, etc.)");
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      onImageSelected(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const clearPreview = () => setPreview(null);

  return (
    <div className="border-t border-white/5 bg-bg-panel/30 px-4 md:px-6 py-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span className="text-xs font-medium text-text-secondary">
          Scan Code Screenshot
        </span>
        <span className="text-xs text-text-muted">
          — Upload or take a photo of your code
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-3">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`flex-1 relative rounded-lg border-2 border-dashed transition-smooth cursor-pointer
            min-h-[80px] flex items-center justify-center
            ${
              dragOver
                ? "border-accent-blue bg-accent-blue/10"
                : "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]"
            }
            ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="relative w-full p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Code screenshot preview"
                className="max-h-32 mx-auto rounded object-contain"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-bg-primary/70 flex items-center justify-center rounded">
                  <div className="spinner" />
                  <span className="ml-2 text-xs text-text-secondary">
                    Extracting code...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 px-6">
              <svg
                className="mx-auto mb-2 text-text-muted"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-xs text-text-muted">
                Drop image here or{" "}
                <span className="text-accent-blue">browse</span>
              </p>
              <p className="text-xs text-text-muted/50 mt-0.5">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex sm:flex-col gap-2">
          {/* File picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                       border border-white/10 hover:border-accent-blue/30 bg-white/5 hover:bg-accent-blue/10
                       text-text-secondary hover:text-accent-blue transition-smooth
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </button>

          {/* Camera (mobile) */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                       border border-white/10 hover:border-accent-cyan/30 bg-white/5 hover:bg-accent-cyan/10
                       text-text-secondary hover:text-accent-cyan transition-smooth
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Camera
          </button>

          {/* Clear preview */}
          {preview && (
            <button
              onClick={clearPreview}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                         border border-white/10 hover:border-error-red/30 bg-white/5 hover:bg-error-red/10
                         text-text-secondary hover:text-error-red transition-smooth
                         disabled:opacity-40"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
