"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Loader2, X } from "lucide-react";
import { useVoiceNotes } from "@/hooks/useVoiceNotes";
import { useVoiceNoteUpdates } from "@/hooks/useRealtime";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { TranscriptViewer } from "@/components/voice/TranscriptViewer";
import { Button } from "@/components/ui/Button";
import type { VoiceNote } from "@/types";

export default function VoiceNotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [showRecorder, setShowRecorder] = useState(false);

  const { data, isLoading, error, refetch } = useVoiceNotes(id);
  const notes = data?.data || [];

  // Invalidate list when transcription completes via Realtime
  useVoiceNoteUpdates(id);

  const handleRecordingComplete = (_voiceNote: VoiceNote) => {
    setShowRecorder(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2">Loading voice notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load voice notes</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recorder Modal */}
      {showRecorder && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-card border-border mx-4 w-full max-w-md rounded-xl border p-6 shadow-xl">
            <VoiceRecorder
              inspectionId={id}
              onUploadComplete={handleRecordingComplete}
              onClose={() => setShowRecorder(false)}
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
            Voice Notes
          </h1>
          <p className="text-muted-foreground">
            {notes.length} voice note{notes.length !== 1 ? "s" : ""}
            {notes.filter((n) => n.processedAt).length > 0 &&
              ` · ${notes.filter((n) => n.processedAt).length} transcribed`}
          </p>
        </div>
        <Button onClick={() => setShowRecorder(true)}>
          <Mic className="mr-2 h-4 w-4" />
          Record Voice Note
        </Button>
      </div>

      {/* Empty State */}
      {notes.length === 0 && (
        <div className="bg-card border-border flex min-h-[400px] flex-col items-center justify-center rounded-xl border p-8 text-center">
          <div className="bg-muted rounded-full p-4">
            <Mic className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground mt-4 text-lg font-semibold">
            No voice notes yet
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Record observations and notes hands-free. AI will transcribe and
            summarize them automatically.
          </p>
          <Button onClick={() => setShowRecorder(true)} className="mt-4">
            <Mic className="mr-2 h-4 w-4" />
            Record Voice Note
          </Button>
        </div>
      )}

      {/* Voice Notes List */}
      {notes.length > 0 && <TranscriptViewer inspectionId={id} />}
    </div>
  );
}
