// Client-only wrapper around window.speechSynthesis for German pronunciation.
// Safe to import from client components: every public function guards against
// SSR / missing APIs. Never import this from a server component or route handler.

let voiceCache: SpeechSynthesisVoice | null | undefined;

function pickGermanVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  if (voiceCache !== undefined) return voiceCache;
  const voices = synth.getVoices();
  voiceCache =
    voices.find((v) => v.lang.toLowerCase().startsWith("de") && v.localService) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("de")) ??
    null;
  return voiceCache;
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

/** Speak German text aloud (rate ~0.9, German voice when available). */
export function speakGerman(text: string, onEnd?: () => void): void {
  if (!isSpeechSupported()) return;
  const clean = text.trim();
  if (!clean) return;
  const synth = window.speechSynthesis;
  synth.cancel(); // stop anything currently playing
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = "de-DE";
  utter.rate = 0.9;
  const voice = pickGermanVoice(synth);
  if (voice) utter.voice = voice;
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();
  synth.speak(utter);
}

// Warm the voice cache — Chrome populates getVoices() lazily.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const synth = window.speechSynthesis;
  const warm = () => {
    voiceCache = undefined;
    pickGermanVoice(synth);
  };
  warm();
  synth.onvoiceschanged = warm;
}
