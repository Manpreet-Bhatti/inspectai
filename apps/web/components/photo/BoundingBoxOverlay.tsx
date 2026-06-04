"use client";

import { useState } from "react";
import type { AIObject } from "@/types";

interface BoundingBoxOverlayProps {
  objects: AIObject[];
  imageWidth: number;
  imageHeight: number;
}

const BOX_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
];

function getColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BOX_COLORS[Math.abs(hash) % BOX_COLORS.length];
}

export function BoundingBoxOverlay({
  objects,
  imageWidth,
  imageHeight,
}: BoundingBoxOverlayProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!objects.length || !imageWidth || !imageHeight) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
      preserveAspectRatio="none"
    >
      {objects.map((obj, i) => {
        const [x, y, w, h] = obj.bbox;
        const color = getColor(obj.label);
        const isHovered = hoveredIndex === i;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill="transparent"
              stroke={color}
              strokeWidth={isHovered ? 3 : 2}
              strokeDasharray={isHovered ? "none" : "none"}
              opacity={isHovered ? 1 : 0.8}
              className="pointer-events-auto cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* Label background */}
            <rect
              x={x}
              y={Math.max(0, y - 22)}
              width={obj.label.length * 7 + 16}
              height={20}
              fill={color}
              rx={3}
              opacity={isHovered ? 1 : 0.85}
              className="pointer-events-auto cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            <text
              x={x + 8}
              y={Math.max(14, y - 6)}
              fill="white"
              fontSize={11}
              fontFamily="system-ui, sans-serif"
              fontWeight="500"
              className="pointer-events-auto cursor-pointer select-none"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {obj.label} {Math.round(obj.confidence * 100)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
