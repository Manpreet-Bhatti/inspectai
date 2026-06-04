"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Square,
  Trash2,
  Save,
  Play,
  Pause,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUploadVoiceNote, useTranscribeVoiceNote } from "@/hooks/useVoiceNotes";
import { cn } from "@/lib/utils";
import type { VoiceNote } from "@/types";

interface VoiceRecorderProps {
  inspectionId: string;
  onUploadComplete?: (voiceNote: VoiceNote) => void;
  onClose?: () => void;
}

type RecorderState = "idle" | "recording" | "review" | "uploading" | "success";

const NUM_BARS = 24;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceRecorder({
  inspectionId,
  onUploadComplete,
  onClose,
}: VoiceRecorderProps) {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  const uploadMutation = useUploadVoiceNote();
  const transcribeMutation = useTranscribeVoiceNote();

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof MediaRecorder !== "undefined"
    );
  }, []);

  const stopWaveform = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    barsRef.current.forEach((bar) => {
      if (bar) bar.style.height = "4px";
    });
    audioContextRef.current?.close();
    audioContextRef.current = null;
  }, []);

  const startWaveform = useCallback(
    (stream: MediaStream) => {
      try {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        const draw = () => {
          analyser.getByteFrequencyData(data);
          barsRef.current.forEach((bar, i) => {
            if (!bar) return;
            const bin = Math.floor((i / NUM_BARS) * data.length);
            const h = Math.max(4, (data[bin] / 255) * 44);
            bar.style.height = `${h}px`;
          });
          animFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
      } catch {
        // AudioContext not available — waveform is decorative, not critical
      }
    },
    []
  );

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        blobRef.current = blob;
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = URL.createObjectURL(blob);
        setRecorderState("review");
      };

      recorder.start(100);
      setRecorderState("recording");
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      startWaveform(stream);
    } catch {
      setError(
        "Could not access microphone. Please allow microphone permissions and try again."
      );
    }
  }, [startWaveform]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopWaveform();

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, [stopWaveform]);

  const discardRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    blobRef.current = null;
    setDuration(0);
    setIsPlaying(false);
    setRecorderState("idle");
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioUrlRef.current) return;

    if (!audioRef.current) {
      const a = new Audio(audioUrlRef.current);
      a.onended = () => setIsPlaying(false);
      audioRef.current = a;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSave = useCallback(async () => {
    if (!blobRef.current) return;

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    setRecorderState("uploading");
    try {
      const voiceNote = await uploadMutation.mutateAsync({
        inspectionId,
        blob: blobRef.current,
        duration,
      });

      // Fire-and-forget transcription — updates arrive via Realtime
      transcribeMutation.mutate(voiceNote.id);

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      setRecorderState("success");
      setTimeout(() => {
        onUploadComplete?.(voiceNote);
        onClose?.();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save voice note"
      );
      setRecorderState("review");
    }
  }, [
    inspectionId,
    duration,
    uploadMutation,
    transcribeMutation,
    onUploadComplete,
    onClose,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWaveform();
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [stopWaveform]);

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-lg font-semibold">
            Record Voice Note
          </h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="bg-destructive/10 text-destructive flex items-center gap-3 rounded-lg p-4 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          Voice recording is not supported in this browser.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Record Voice Note
          </h2>
          <p className="text-muted-foreground text-sm">
            Capture observations hands-free
          </p>
        </div>
        {onClose && recorderState !== "uploading" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={
              recorderState === "recording"
                ? () => {
                    stopRecording();
                    onClose();
                  }
                : onClose
            }
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Waveform visualizer */}
      <div className="flex h-12 items-end justify-center gap-[3px]">
        {Array.from({ length: NUM_BARS }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              barsRef.current[i] = el;
            }}
            className={cn(
              "w-[3px] rounded-full",
              recorderState === "recording"
                ? "bg-primary"
                : "bg-muted-foreground/30"
            )}
            style={{ height: "4px" }}
          />
        ))}
      </div>

      {/* Duration */}
      <div className="flex flex-col items-center gap-2">
        <span
          className={cn(
            "font-mono text-5xl font-bold tabular-nums",
            recorderState === "recording" ? "text-primary" : "text-foreground"
          )}
        >
          {formatDuration(duration)}
        </span>
        <p className="text-muted-foreground text-sm">
          {recorderState === "idle" && "Press record to start"}
          {recorderState === "recording" && "Recording in progress..."}
          {recorderState === "review" && "Review your recording"}
          {recorderState === "uploading" && "Saving voice note..."}
          {recorderState === "success" && "Voice note saved!"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {recorderState === "idle" && (
          <button
            onClick={startRecording}
            className="bg-primary hover:bg-primary/90 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95"
            aria-label="Start recording"
          >
            <Mic className="h-7 w-7" />
          </button>
        )}

        {recorderState === "recording" && (
          <button
            onClick={stopRecording}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 active:scale-95"
            aria-label="Stop recording"
          >
            <Square className="h-6 w-6 fill-current" />
          </button>
        )}

        {recorderState === "review" && (
          <>
            <button
              onClick={discardRecording}
              className="border-input bg-background text-destructive hover:bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-all active:scale-95"
              aria-label="Discard recording"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={togglePlayback}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg transition-all hover:bg-purple-600 active:scale-95"
              aria-label={isPlaying ? "Pause playback" : "Play recording"}
            >
              {isPlaying ? (
                <Pause className="h-7 w-7" />
              ) : (
                <Play className="h-7 w-7 translate-x-0.5" />
              )}
            </button>
            <button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm transition-all active:scale-95"
              aria-label="Save recording"
            >
              <Save className="h-5 w-5" />
            </button>
          </>
        )}

        {recorderState === "uploading" && (
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <Loader2 className="text-primary h-7 w-7 animate-spin" />
          </div>
        )}

        {recorderState === "success" && (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        )}
      </div>

      {/* Control labels */}
      {recorderState === "review" && (
        <div className="flex justify-center gap-6">
          <span className="text-muted-foreground w-12 text-center text-xs">
            Discard
          </span>
          <span className="text-muted-foreground w-16 text-center text-xs">
            {isPlaying ? "Pause" : "Play"}
          </span>
          <span className="text-muted-foreground w-12 text-center text-xs">
            Save
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive flex items-start gap-3 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
