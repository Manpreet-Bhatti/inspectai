"use client";

import { Check, Clock, AlertCircle, FileText, Camera, Mic } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  type:
    | "created"
    | "photo_added"
    | "voice_added"
    | "finding_added"
    | "status_changed"
    | "report_generated";
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface InspectionTimelineProps {
  events: TimelineEvent[];
}

function getEventIcon(type: TimelineEvent["type"]) {
  switch (type) {
    case "created":
      return <Check className="h-4 w-4" />;
    case "photo_added":
      return <Camera className="h-4 w-4" />;
    case "voice_added":
      return <Mic className="h-4 w-4" />;
    case "finding_added":
      return <AlertCircle className="h-4 w-4" />;
    case "status_changed":
      return <Clock className="h-4 w-4" />;
    case "report_generated":
      return <FileText className="h-4 w-4" />;
    default:
      return <Check className="h-4 w-4" />;
  }
}

function getEventColor(type: TimelineEvent["type"]) {
  switch (type) {
    case "created":
      return "bg-green-500";
    case "photo_added":
      return "bg-blue-500";
    case "voice_added":
      return "bg-purple-500";
    case "finding_added":
      return "bg-amber-500";
    case "status_changed":
      return "bg-muted-foreground";
    case "report_generated":
      return "bg-green-500";
    default:
      return "bg-muted-foreground";
  }
}

export function InspectionTimeline({ events }: InspectionTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Icon */}
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${getEventColor(
                event.type
              )}`}
            >
              {getEventIcon(event.type)}
            </div>
            {index < sortedEvents.length - 1 && (
              <div className="bg-border mt-2 h-full w-px" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <p className="text-foreground font-medium">{event.title}</p>
              <span className="text-muted-foreground text-xs">
                {formatRelativeTime(event.timestamp)}
              </span>
            </div>
            {event.description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {event.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Example usage with mock data
export function InspectionTimelineExample() {
  const mockEvents: TimelineEvent[] = [
    {
      id: "1",
      type: "report_generated",
      title: "Report generated",
      description: "Full inspection report is ready for download",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "finding_added",
      title: "New finding added",
      description: "Water damage on ceiling - Major severity",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "3",
      type: "photo_added",
      title: "Photos uploaded",
      description: "12 new photos added to the inspection",
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: "4",
      type: "created",
      title: "Inspection created",
      timestamp: new Date(Date.now() - 86400000),
    },
  ];

  return <InspectionTimeline events={mockEvents} />;
}
