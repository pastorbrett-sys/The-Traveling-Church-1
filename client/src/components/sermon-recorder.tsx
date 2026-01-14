import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, X, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiFetch, queryClient } from "@/lib/queryClient";
import { usePlatform } from "@/contexts/platform-context";

const TAGS = ["Faith", "Hope", "Gratitude", "Prayer", "Question", "Sermon"];

type RecordingState = "idle" | "recording" | "processing" | "review";

interface SermonRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgradeNeeded: () => void;
}

export function SermonRecorder({ open, onOpenChange, onUpgradeNeeded }: SermonRecorderProps) {
  const { toast } = useToast();
  const { isNative } = usePlatform();
  const [state, setState] = useState<RecordingState>("idle");
  const [transcription, setTranscription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Sermon"]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount or dialog close
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      stopRecordingCleanup();
      setState("idle");
      setTranscription("");
      setSelectedTags(["Sermon"]);
      setRecordingTime(0);
      setAudioBlob(null);
    }
  }, [open]);

  const stopRecordingCleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const transcribeMutation = useMutation({
    mutationFn: async (audio: Blob) => {
      const formData = new FormData();
      formData.append("audio", audio, "recording.webm");
      
      const res = await apiFetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      
      if (res.status === 429) {
        const errorData = await res.json();
        throw { status: 429, ...errorData };
      }
      if (res.status === 403) {
        const errorData = await res.json();
        throw { status: 403, ...errorData };
      }
      if (!res.ok) {
        throw new Error("Failed to transcribe audio");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setTranscription(data.text || "");
      setState("review");
    },
    onError: (error: any) => {
      if (error?.status === 403) {
        // Non-Pro user - show upgrade dialog
        onUpgradeNeeded();
        onOpenChange(false);
        return;
      }
      if (error?.status === 429) {
        // Pro user hit monthly limit
        toast({ 
          title: "Monthly limit reached", 
          description: error.message || "You've used all your sermon transcriptions this month.",
          variant: "destructive" 
        });
        onOpenChange(false);
        return;
      }
      toast({ 
        title: "Transcription failed", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
      setState("idle");
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (data: { content: string; tags: string[] }) => {
      const res = await apiFetch("/api/notes/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 429) {
        const errorData = await res.json();
        throw { status: 429, ...errorData };
      }
      if (!res.ok) {
        throw new Error("Failed to save note");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Sermon note saved!" });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error?.status === 429) {
        onUpgradeNeeded();
        return;
      }
      toast({ 
        title: "Failed to save note", 
        variant: "destructive" 
      });
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        setAudioBlob(audioBlob);
        setState("processing");
        transcribeMutation.mutate(audioBlob);
      };

      mediaRecorder.start(1000); // Collect data every second
      setState("recording");
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error: any) {
      console.error("Error accessing microphone:", error);
      toast({ 
        title: "Microphone access denied", 
        description: "Please allow microphone access to record sermons",
        variant: "destructive" 
      });
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleSave = () => {
    if (!transcription.trim()) {
      toast({ title: "Please add some content", variant: "destructive" });
      return;
    }
    saveNoteMutation.mutate({
      content: transcription,
      tags: selectedTags,
    });
  };

  const handleRetry = () => {
    setState("idle");
    setTranscription("");
    setRecordingTime(0);
    setAudioBlob(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden"
        style={isNative ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' } : undefined}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#c08e00]" />
              {state === "idle" && "Record Sermon"}
              {state === "recording" && "Recording..."}
              {state === "processing" && "Transcribing..."}
              {state === "review" && "Review Transcription"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
              data-testid="button-close-recorder"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Idle State - Ready to record */}
          {state === "idle" && (
            <div className="flex flex-col items-center py-8">
              <p className="text-muted-foreground text-center mb-6 max-w-xs">
                Tap to start recording. When you stop, we'll transcribe the audio and save it as a note.
              </p>
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-[#c08e00] flex items-center justify-center hover:bg-[#a07800] transition-all hover:scale-105 active:scale-95"
                data-testid="button-start-recording"
              >
                <Mic className="w-8 h-8 text-white" />
              </button>
              <p className="text-sm text-muted-foreground mt-4">
                Pro feature • 4 sermons/month
              </p>
            </div>
          )}

          {/* Recording State */}
          {state === "recording" && (
            <div className="flex flex-col items-center py-8">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping opacity-50" />
              </div>
              <p className="text-2xl font-mono font-bold text-red-500 mb-4">
                {formatTime(recordingTime)}
              </p>
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-all"
                data-testid="button-stop-recording"
              >
                <Square className="w-6 h-6 text-white fill-white" />
              </button>
              <p className="text-sm text-muted-foreground mt-4">
                Tap to stop recording
              </p>
            </div>
          )}

          {/* Processing State */}
          {state === "processing" && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-12 h-12 text-[#c08e00] animate-spin mb-4" />
              <p className="text-muted-foreground">
                Transcribing {formatTime(recordingTime)} of audio...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This may take a moment
              </p>
            </div>
          )}

          {/* Review State */}
          {state === "review" && (
            <>
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Transcribed text will appear here..."
                className="min-h-[200px] resize-none"
                data-testid="textarea-transcription"
              />
              
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedTags.includes(tag) 
                          ? "bg-[#c08e00] hover:bg-[#a07800]" 
                          : "hover:bg-[#c08e00]/10"
                      }`}
                      onClick={() => toggleTag(tag)}
                      data-testid={`tag-${tag.toLowerCase()}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex-1 gap-2"
                  data-testid="button-retry-recording"
                >
                  <RotateCcw className="w-4 h-4" />
                  Record Again
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveNoteMutation.isPending || !transcription.trim()}
                  className="flex-1 gap-2 bg-[#c08e00] hover:bg-[#a07800]"
                  data-testid="button-save-transcription"
                >
                  {saveNoteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Note
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
