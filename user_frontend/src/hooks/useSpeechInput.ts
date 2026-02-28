import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionInstance = SpeechRecognition | null;

interface UseSpeechInputOptions {
  /** BCP-47 language code, e.g. "en-IN", "hi-IN", "gu-IN" */
  language?: string;
}

interface UseSpeechInputResult {
  listening: boolean;
  transcript: string;
  error: string | null;
  startListening: (onResult: (text: string) => void, options?: UseSpeechInputOptions) => void;
  stopListening: () => void;
}

export function useSpeechInput(): UseSpeechInputResult {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<RecognitionInstance>(null);
  const resultCallbackRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    const SpeechRecognitionImpl =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionImpl();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript.trim();
      setTranscript(text);
      if (resultCallbackRef.current) {
        resultCallbackRef.current(text);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error || "Speech recognition error");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(
    (onResult: (text: string) => void, options?: UseSpeechInputOptions) => {
      const recognition = recognitionRef.current;
      if (!recognition) {
        setError("Speech recognition is not available.");
        return;
      }
      setError(null);
      setTranscript("");
      resultCallbackRef.current = onResult;
      if (options?.language) {
        recognition.lang = options.language;
      }
      try {
        recognition.start();
        setListening(true);
      } catch (err) {
        setError("Unable to start microphone. Please check permissions.");
      }
    },
    []
  );

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
    }
    setListening(false);
  }, []);

  return { listening, transcript, error, startListening, stopListening };
}

