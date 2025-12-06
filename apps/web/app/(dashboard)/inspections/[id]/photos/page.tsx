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
} from "lucide-react";

const photos = [
  {
    id: "1",
    fileName: "exterior_front.jpg",
    thumbnailUrl: "/api/placeholder/300/200",
    category: "EXTERIOR",
    location: "Front Entrance",
    aiCaption: "Front view of a two-story single family home with brick facade",
    aiCondition: "Good condition",
    aiConfidence: 0.92,
    processedAt: "2024-01-15T10:30:00",
  },
  {
    id: "2",
    fileName: "roof_north.jpg",
    thumbnailUrl: "/api/placeholder/300/200",
    category: "ROOF",
    location: "North Side",
    aiCaption: "Asphalt shingle roof showing signs of weathering",
    aiCondition: "Fair condition",
    aiConfidence: 0.87,
    processedAt: "2024-01-15T10:31:00",
  },
  {
    id: "3",
    fileName: "living_room.jpg",
    thumbnailUrl: "/api/placeholder/300/200",
    category: "INTERIOR",
    location: "Living Room",
    aiCaption: "Spacious living room with water stain visible on ceiling",
    aiCondition: "Damaged",
    aiConfidence: 0.95,
    processedAt: "2024-01-15T10:32:00",
  },
  {
    id: "4",
    fileName: "electrical_panel.jpg",
    thumbnailUrl: "/api/placeholder/300/200",
    category: "ELECTRICAL",
    location: "Basement",
    aiCaption: "Outdated electrical panel with Federal Pacific breakers",
    aiCondition: "Poor condition",
    aiConfidence: 0.91,
    processedAt: "2024-01-15T10:33:00",
  },
  {
    id: "5",
    fileName: "foundation_crack.jpg",
    thumbnailUrl: "/api/placeholder/300/200",
    category: "FOUNDATION",
    location: "Southeast Corner",
    aiCaption: "Hairline crack in concrete foundation wall",
    aiCondition: "Fair condition",
    aiConfidence: 0.88,
    processedAt: "2024-01-15T10:34:00",
  },
  {
    id: "6",
    fileName: "hvac_unit.jpg",
    thumbnailUrl: "/api/placeholder/300/200",
    category: "HVAC",
    location: "Utility Room",
    aiCaption: "Central air conditioning unit, approximately 10 years old",
    aiCondition: "Good condition",
    aiConfidence: 0.85,
    processedAt: "2024-01-15T10:35:00",
  },
];

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

  const filteredPhotos =
    selectedCategory === "All"
      ? photos
      : photos.filter((p) => p.category === selectedCategory);

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  return (
    <div className="space-y-6">
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
            {photos.length} photos · {selectedPhotos.length} selected
          </p>
        </div>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors">
          <Upload className="h-4 w-4" />
          Upload Photos
        </button>
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
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search photos..."
              className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary rounded-lg border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1"
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
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Analyze Selected
          </button>
          <button
            onClick={() => setSelectedPhotos([])}
            className="border-input bg-background text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium"
          >
            <X className="h-4 w-4" />
            Clear Selection
          </button>
        </div>
      )}

      {/* Photos Grid */}
      {viewMode === "grid" ? (
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
                className={`absolute left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-md border transition-all ${
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
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  Photo Preview
                </div>
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

                {photo.aiCaption && (
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
                      {getConditionBadge(photo.aiCondition)}
                      <span className="text-muted-foreground text-xs">
                        {Math.round(photo.aiConfidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Photos List View */
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
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    AI Caption
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
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
                        <div className="bg-muted h-10 w-14 rounded" />
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
                      {getConditionBadge(photo.aiCondition)}
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
