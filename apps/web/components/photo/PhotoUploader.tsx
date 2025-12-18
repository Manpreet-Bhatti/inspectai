"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUploadPhotos } from "@/hooks/usePhotos";
import { cn } from "@/lib/utils";
import type { PhotoCategory } from "@/types";

interface PhotoUploaderProps {
  inspectionId: string;
  onUploadComplete?: () => void;
  onClose?: () => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface UploadStatus {
  status: "idle" | "uploading" | "success" | "error";
  message?: string;
}

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const photoCategories: { value: PhotoCategory; label: string }[] = [
  { value: "EXTERIOR", label: "Exterior" },
  { value: "INTERIOR", label: "Interior" },
  { value: "ROOF", label: "Roof" },
  { value: "FOUNDATION", label: "Foundation" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "HVAC", label: "HVAC" },
  { value: "STRUCTURAL", label: "Structural" },
  { value: "OTHER", label: "Other" },
];

export function PhotoUploader({
  inspectionId,
  onUploadComplete,
  onClose,
}: PhotoUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [category, setCategory] = useState<PhotoCategory>("OTHER");
  const [location, setLocation] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadPhotos();

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return `${file.name}: Invalid file type. Please use JPEG, PNG, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large. Maximum size is 10MB.`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          id: `${file.name}-${Date.now()}-${Math.random()}`,
        });
      }
    });

    if (errors.length > 0) {
      setUploadStatus({ status: "error", message: errors.join("\n") });
    }

    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }

    e.target.value = "";
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploadStatus({ status: "uploading" });

    try {
      await uploadMutation.mutateAsync({
        inspectionId,
        files: files.map((f) => f.file),
        category,
        location: location || undefined,
      });

      setUploadStatus({
        status: "success",
        message: `Successfully uploaded ${files.length} photo(s)`,
      });

      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);

      setTimeout(() => {
        onUploadComplete?.();
      }, 1500);
    } catch (error) {
      setUploadStatus({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to upload photos",
      });
    }
  };

  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setUploadStatus({ status: "idle" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Upload Photos
          </h2>
          <p className="text-muted-foreground text-sm">
            Add photos to this inspection
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground",
          uploadStatus.status === "uploading" &&
            "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="bg-muted rounded-full p-4">
            <Upload className="text-muted-foreground h-8 w-8" />
          </div>
          <div>
            <p className="text-foreground font-medium">
              Drop photos here or click to browse
            </p>
            <p className="text-muted-foreground text-sm">
              JPEG, PNG, or WebP up to 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-foreground text-sm font-medium">
              {files.length} photo{files.length !== 1 ? "s" : ""} selected
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={uploadStatus.status === "uploading"}
            >
              Clear all
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {files.map((file) => (
              <div
                key={file.id}
                className="group relative aspect-square overflow-hidden rounded-lg"
              >
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  disabled={uploadStatus.status === "uploading"}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="absolute right-0 bottom-0 left-0 truncate bg-black/50 px-2 py-1 text-xs text-white">
                  {file.file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category and Location */}
      {files.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PhotoCategory)}
              disabled={uploadStatus.status === "uploading"}
              className="border-input bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            >
              {photoCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Location (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Living Room, Basement"
              disabled={uploadStatus.status === "uploading"}
              className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Status Message */}
      {uploadStatus.status !== "idle" && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-lg p-4",
            uploadStatus.status === "uploading" && "bg-muted",
            uploadStatus.status === "success" && "bg-green-500/10",
            uploadStatus.status === "error" && "bg-destructive/10"
          )}
        >
          {uploadStatus.status === "uploading" && (
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
          )}
          {uploadStatus.status === "success" && (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          )}
          {uploadStatus.status === "error" && (
            <AlertCircle className="text-destructive h-5 w-5" />
          )}
          <p
            className={cn(
              "text-sm whitespace-pre-line",
              uploadStatus.status === "uploading" && "text-foreground",
              uploadStatus.status === "success" && "text-green-600",
              uploadStatus.status === "error" && "text-destructive"
            )}
          >
            {uploadStatus.status === "uploading"
              ? "Uploading photos..."
              : uploadStatus.message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            disabled={uploadStatus.status === "uploading"}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploadStatus.status === "uploading"}
        >
          {uploadStatus.status === "uploading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload{" "}
              {files.length > 0
                ? `${files.length} Photo${files.length !== 1 ? "s" : ""}`
                : "Photos"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
