"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Grid,
  List,
  Filter,
  Search,
  Sparkles,
  Check,
  X,
  MoreVertical,
  Loader2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import {
  usePhotos,
  useDeletePhoto,
  useBatchAnalyzePhotos,
} from "@/hooks/usePhotos";
import { PhotoUploader } from "@/components/photo/PhotoUploader";
import { Button } from "@/components/ui/Button";

const categories = [
  "All",
  "EXTERIOR",
  "INTERIOR",
  "ROOF",
  "FOUNDATION",
  "ELECTRICAL",
  "PLUMBING",
  "HVAC",
  "STRUCTURAL",
  "OTHER",
];

function getConditionBadge(condition: string) {
  switch (condition.toLowerCase()) {
    case "good condition":
      return (
        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
          Good
        </span>
      );
    case "fair condition":
      return (
        <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
          Fair
        </span>
      );
    case "poor condition":
      return (
        <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
          Poor
        </span>
      );
    case "damaged":
      return (
        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
          Damaged
        </span>
      );
    default:
      return (
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
          {condition}
        </span>
      );
  }
}

export default function PhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch photos using the hook
  const { data: photosData, isLoading, error, refetch } = usePhotos(id);
  const deletePhotoMutation = useDeletePhoto();
  const analyzePhotosMutation = useBatchAnalyzePhotos();

  const photos = photosData?.data || [];

  // Filter photos by category and search
  const filteredPhotos = photos.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.aiCaption?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeleteSelected = async () => {
    if (selectedPhotos.length === 0) return;

    try {
      await Promise.all(
        selectedPhotos.map((photoId) =>
          deletePhotoMutation.mutateAsync(photoId)
        )
      );
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Failed to delete photos:", error);
    }
  };

  const handleAnalyzeSelected = async () => {
    if (selectedPhotos.length === 0) return;

    try {
      await analyzePhotosMutation.mutateAsync(selectedPhotos);
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Failed to analyze photos:", error);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2">Loading photos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load photos</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Modal */}
      {showUploader && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-card border-border mx-4 w-full max-w-2xl rounded-xl border p-6 shadow-xl">
            <PhotoUploader
              inspectionId={id}
              onUploadComplete={() => {
                setShowUploader(false);
                refetch();
              }}
              onClose={() => setShowUploader(false)}
            />
          </div>
        </div>
      )}

      {/* Back Link */}
      <Link
        href={`/inspections/${id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to inspection
      </Link>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Photos
          </h1>
          <p className="text-muted-foreground">
            {photos.length} photo{photos.length !== 1 ? "s" : ""} ·{" "}
            {selectedPhotos.length} selected
          </p>
        </div>
        <Button onClick={() => setShowUploader(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Photos
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photos..."
              className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary rounded-lg border py-2 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
            />
          </div>

          <div className="border-input flex rounded-lg border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button className="border-input bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPhotos.length > 0 && (
        <div className="bg-muted flex items-center gap-4 rounded-lg p-4">
          <span className="text-foreground text-sm font-medium">
            {selectedPhotos.length} selected
          </span>
          <Button
            size="sm"
            onClick={handleAnalyzeSelected}
            disabled={analyzePhotosMutation.isPending}
          >
            {analyzePhotosMutation.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-1 h-4 w-4" />
            )}
            Analyze Selected
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDeleteSelected}
            disabled={deletePhotoMutation.isPending}
          >
            {deletePhotoMutation.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4" />
            )}
            Delete Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedPhotos([])}
          >
            <X className="mr-1 h-4 w-4" />
            Clear Selection
          </Button>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="bg-card border-border flex min-h-[400px] flex-col items-center justify-center rounded-xl border p-8 text-center">
          <div className="bg-muted rounded-full p-4">
            <ImageIcon className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground mt-4 text-lg font-semibold">
            No photos yet
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Upload photos to start documenting this inspection. You can drag and
            drop multiple files at once.
          </p>
          <Button onClick={() => setShowUploader(true)} className="mt-4">
            <Upload className="mr-2 h-4 w-4" />
            Upload Photos
          </Button>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className={`bg-card group relative overflow-hidden rounded-xl border shadow-sm transition-all ${
                selectedPhotos.includes(photo.id)
                  ? "border-primary ring-primary/20 ring-2"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              {/* Selection Checkbox */}
              <button
                onClick={() => togglePhotoSelection(photo.id)}
                className={`absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-md border transition-all ${
                  selectedPhotos.includes(photo.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/50 bg-black/30 text-white opacity-0 group-hover:opacity-100"
                }`}
              >
                {selectedPhotos.includes(photo.id) && (
                  <Check className="h-4 w-4" />
                )}
              </button>

              {/* Image */}
              <div className="bg-muted aspect-video">
                {photo.originalUrl || photo.thumbnailUrl ? (
                  <img
                    src={photo.thumbnailUrl || photo.originalUrl || ""}
                    alt={photo.fileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-foreground truncate font-medium">
                      {photo.fileName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {photo.location}
                    </p>
                  </div>
                  <button className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {photo.aiCaption ? (
                  <div className="bg-muted/50 mt-3 rounded-lg p-2">
                    <div className="mb-1 flex items-center gap-1">
                      <Sparkles className="text-primary h-3 w-3" />
                      <span className="text-primary text-xs font-medium">
                        AI Analysis
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {photo.aiCaption}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {photo.aiCondition
                        ? getConditionBadge(photo.aiCondition)
                        : null}
                      {photo.aiConfidence && (
                        <span className="text-muted-foreground text-xs">
                          {Math.round(photo.aiConfidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 mt-3 rounded-lg p-2">
                    <p className="text-muted-foreground text-center text-xs">
                      Not analyzed yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photos List View */}
      {photos.length > 0 && viewMode === "list" && (
        <div className="border-border bg-card rounded-xl border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border bg-muted/50 border-b">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="border-input h-4 w-4 rounded"
                    />
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Photo
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Category
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Location
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    AI Caption
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                    Condition
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filteredPhotos.map((photo) => (
                  <tr key={photo.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPhotos.includes(photo.id)}
                        onChange={() => togglePhotoSelection(photo.id)}
                        className="border-input h-4 w-4 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {photo.thumbnailUrl || photo.originalUrl ? (
                          <img
                            src={photo.thumbnailUrl || photo.originalUrl || ""}
                            alt={photo.fileName}
                            className="h-10 w-14 rounded object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-10 w-14 items-center justify-center rounded">
                            <ImageIcon className="text-muted-foreground h-4 w-4" />
                          </div>
                        )}
                        <span className="text-foreground font-medium">
                          {photo.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {photo.category}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {photo.location}
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="text-muted-foreground truncate text-sm">
                        {photo.aiCaption}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {photo.aiCondition ? (
                        getConditionBadge(photo.aiCondition)
                      ) : (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                          Not analyzed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
