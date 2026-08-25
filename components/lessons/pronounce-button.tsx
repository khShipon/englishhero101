"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Free pronunciation audio via the browser's built-in Web Speech API —
// no API key, no cost. Chrome/Edge/Android surface Google's own TTS
// voices through this exact API, which is what makes this "free Google
// pronunciation" without touching a paid Cloud TTS endpoint.
function speak(text: string, onStart: () => void, onEnd: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((voice) => voice.name.includes("Google") && voice.lang.startsWith("en")) ??
    voices.find((voice) => voice.lang.startsWith("en"));
  if (preferredVoice) utterance.voice = preferredVoice;

  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function PronounceButton({ text, label }: { text: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false);

  return (
    <button
      type="button"
      onClick={() => speak(text, () => setSpeaking(true), () => setSpeaking(false))}
      aria-label={`Listen to pronunciation: ${text}`}
      className={cn(
        "mx-0.5 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 align-middle text-[0.9em] font-medium text-foreground hover:bg-primary/10",
        speaking && "bg-primary/15",
      )}
    >
      <Volume2 className={cn("size-3.5 text-primary", speaking && "animate-pulse")} />
      {label ?? text}
    </button>
  );
}
