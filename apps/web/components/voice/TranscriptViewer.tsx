"use client";

import { useState } from "react";
import {
  Mic,
  Trash2,
  Sparkles,
  Loader2,
  FileText,
  Play,
  Pause,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useVoiceNotes,
  useDeleteVoiceNote,
  useTranscribeVoiceNote,
} from "@/hooks/useVoiceNotes";
import type { VoiceNote } from "@/types";

interface TranscriptViewerProps {
  inspectionId: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: unknown): string {
  if (!dateStr) return "";
  return new Date(dateStr as string).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VoiceNoteCard({ note }: { note: VoiceNote }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const deleteMutation = useDeleteVoiceNote();
  const transcribeMutation = useTranscribeVoiceNote();

  const audioUrl = (note as unknown as { audioUrl: string | null }).audioUrl;

  const togglePlay = () => {
    if (!audioUrl) return;

    if (!audioEl) {
      const a = new Audio(audioUrl);
      a.onended = () => setIsPlaying(false);
      setAudioEl(a);
      a.play();
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      audioEl.play();
      setIsPlaying(true);
    }
  };

  const handleDelete = async () => {
    audioEl?.pause();
    await deleteMutation.mutateAsync(note.id);
  };

  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={!audioUrl}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 transition-colors hover:bg-purple-500/20 disabled:opacity-40 dark:text-purple-400"
            aria-label={isPlaying ? "Pause" : "Play voice note"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 translate-x-0.5" />
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-medium">
                Voice Note
              </span>
              {note.processedAt ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                  Transcribed
                </span>
              ) : note.error ? (
                <span className="bg-destructive/10 text-destructive inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Error
                </span>
              ) : (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                  Pending
                </span>
              )}
            </div>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(note.duration)}
              </span>
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!note.processedAt && !note.error && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => transcribeMutation.mutate(note.id)}
              disabled={transcribeMutation.isPending}
              className="h-8 px-2"
              title="Queue transcription"
            >
              {transcribeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-destructive hover:text-destructive h-8 px-2"
            title="Delete voice note"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Transcript */}
      {note.transcript && (
        <div className="border-border mt-3 border-t pt-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <FileText className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Transcript
            </span>
          </div>
          <p className="text-foreground text-sm leading-relaxed">
            {note.transcript}
          </p>
        </div>
      )}

      {/* Summary */}
      {note.summary && (
        <div className="bg-muted/50 mt-3 rounded-lg px-3 py-2">
          <p className="text-muted-foreground mb-1 text-xs font-medium">
            Summary
          </p>
          <p className="text-foreground text-sm">{note.summary}</p>
        </div>
      )}

      {/* Error detail */}
      {note.error && (
        <div className="bg-destructive/5 text-destructive mt-3 rounded-lg px-3 py-2 text-xs">
          {note.error}
        </div>
      )}
    </div>
  );
}

export function TranscriptViewer({ inspectionId }: TranscriptViewerProps) {
  const { data, isLoading, error, refetch } = useVoiceNotes(inspectionId);
  const notes = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive text-sm">Failed to load voice notes</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-3"
        >
          Try again
        </Button>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-muted rounded-full p-4">
          <Mic className="text-muted-foreground h-6 w-6" />
        </div>
        <p className="text-foreground mt-3 font-medium">No voice notes yet</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Record observations to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <VoiceNoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
