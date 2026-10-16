"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { speakGerman, isSpeechSupported } from "@/lib/speech";

interface SpeakButtonProps {
  /** German text to speak aloud. */
  text: string;
  /** Extra classes (e.g. sizing). */
  className?: string;
  /** Use the translucent style for dark/gradient backgrounds. */
  dark?: boolean;
}

/**
 * Small animated speaker button. Renders nothing on the server or where the
 * Web Speech API is unavailable. Stops pointer events from reaching parents
 * (e.g. flip cards) via onPointerDown capture.
 */
export default function SpeakButton({ text, className = "", dark = false }: SpeakButtonProps) {
  const [ready, setReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setReady(isSpeechSupported());
  }, []);

  if (!ready) return null;

  const handle = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSpeaking(true);
    speakGerman(text, () => setSpeaking(false));
  };

  return (
    <motion.button
      type="button"
      onClick={handle}
      onPointerDown={(e) => e.stopPropagation()}
      whileTap={{ scale: 0.82 }}
      aria-label="উচ্চারণ শোনো"
      title="উচ্চারণ শোনো (Aussprache)"
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm transition active:scale-95 ${
        speaking
          ? "bg-navy text-white"
          : dark
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-teal text-white hover:bg-[#0DA678]"
      } ${className}`}
    >
      {speaking ? (
        <span className="flex items-end gap-[2px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-current"
              animate={{ height: [5, 13, 5] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.14 }}
            />
          ))}
        </span>
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden />
      )}
    </motion.button>
  );
}
