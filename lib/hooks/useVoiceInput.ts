"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "listening" | "unsupported" | "denied";

export type VoiceLang = "id-ID" | "en-US";

export interface UseVoiceInputReturn {
  isSupported: boolean;
  status: VoiceStatus;
  /** Live interim transcript (not yet final, updates rapidly while speaking) */
  interimText: string;
  /** Accumulated final transcript from the current recording session */
  finalText: string;
  error: string | null;
  lang: VoiceLang;
  setLang: (lang: VoiceLang) => void;
  setFinalText: (text: string) => void;
  start: () => void;
  stop: () => void;
  clear: () => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [lang, setLang] = useState<VoiceLang>("id-ID");
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Track latest interim text via ref so onend can flush it (avoids stale closure)
  const interimTextRef = useRef("");

  const isSupported =
    typeof window !== "undefined" &&
    !!(
      ("SpeechRecognition" in window && window.SpeechRecognition) ||
      ("webkitSpeechRecognition" in window && window.webkitSpeechRecognition)
    );

  useEffect(() => {
    if (typeof window !== "undefined" && !isSupported) {
      setStatus("unsupported");
    }
  }, [isSupported]);

  // Abort any in-flight recognition when the component unmounts
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      setStatus("unsupported");
      return;
    }
    // Stop any existing session first
    recognitionRef.current?.abort();

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();

    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false; // Auto-stops after a pause — cleaner UX
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus("listening");
      setError(null);
    };

    recognition.onresult = (ev: SpeechRecognitionEvent) => {
      let interim = "";
      let newFinal = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const transcript = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) {
          newFinal += transcript;
        } else {
          interim += transcript;
        }
      }
      interimTextRef.current = interim;
      setInterimText(interim);
      if (newFinal) {
        interimTextRef.current = ""; // final consumed — clear ref
        setFinalText((prev) => {
          // Add a space between previous final text and new chunk
          const sep = prev && !prev.endsWith(" ") ? " " : "";
          return prev + sep + newFinal;
        });
      }
    };

    recognition.onerror = (ev: SpeechRecognitionErrorEvent) => {
      setInterimText("");
      if (ev.error === "not-allowed" || ev.error === "permission-denied") {
        setStatus("denied");
        setError(
          "Izin mikrofon ditolak. Izinkan akses mikrofon di pengaturan browser, lalu coba lagi."
        );
      } else if (ev.error === "no-speech") {
        setStatus("idle");
        setError("Tidak ada suara terdeteksi. Pastikan mikrofon aktif dan coba lagi.");
      } else if (ev.error === "aborted") {
        setStatus("idle");
        // User or code called stop/abort — not an error, no message
      } else if (ev.error === "network") {
        setStatus("idle");
        setError("Koneksi internet diperlukan untuk transkripsi. Periksa koneksimu.");
      } else {
        setStatus("idle");
        setError(`Terjadi error: ${ev.error}. Coba lagi.`);
      }
    };

    recognition.onend = () => {
      // Flush any remaining interim text as final (happens when stop() is called
      // while speech recognition hasn't yet produced a isFinal result)
      const leftover = interimTextRef.current;
      if (leftover) {
        setFinalText((prev) => {
          const sep = prev && !prev.endsWith(" ") ? " " : "";
          return prev + sep + leftover;
        });
        interimTextRef.current = "";
      }
      setInterimText("");
      setStatus("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    // onend will fire and set status to idle
  }, []);

  const clear = useCallback(() => {
    recognitionRef.current?.abort();
    interimTextRef.current = "";
    setFinalText("");
    setInterimText("");
    setError(null);
    setStatus(isSupported ? "idle" : "unsupported");
  }, [isSupported]);

  return {
    isSupported,
    status,
    interimText,
    finalText,
    error,
    lang,
    setLang,
    setFinalText,
    start,
    stop,
    clear,
  };
}
