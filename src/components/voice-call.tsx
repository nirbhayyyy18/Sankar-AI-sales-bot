
"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { saveCallRecord } from "@/lib/call-history";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mic,
  Phone,
  PhoneOff,
  UserRound,
} from "lucide-react";

type TranscriptEntry = {
  role: "user" | "assistant";
  text: string;
};

type PreparedCustomer = {
  name?: unknown;
  phone?: unknown;
};

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

export default function VoiceCall() {
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const callStartedAtRef = useRef<number | null>(null);
  const customerNameRef = useRef("Voice demo");

  const [isConnected, setIsConnected] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready to connect");

  useEffect(() => {
    if (!publicKey || !assistantId) return;

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setIsConnected(true);
      transcriptRef.current = [];
      callStartedAtRef.current = Date.now();

      setTranscript([]);
      setIsStarting(false);
      setStatus("Connected · Speak naturally");
      setError("");
      setElapsed(0);
      setStartedAt(Date.now());
    });

    vapi.on("call-end", () => {
      const startTime = callStartedAtRef.current;

      if (startTime !== null) {
        const duration = Math.floor(
          (Date.now() - startTime) / 1000,
        );
        const savedTranscript = [...transcriptRef.current];

        try {
          saveCallRecord({
            id: crypto.randomUUID(),
            customerName: customerNameRef.current,
            date: new Date().toISOString(),
            duration,
            status:
              savedTranscript.length > 0
                ? "Follow-up Required"
                : "No Response",
            transcript: savedTranscript,
            summary:
              savedTranscript.length > 0
                ? "Call completed. Review the transcript for customer needs, objections, and next steps."
                : "No transcript was captured during this call.",
          });

          setStatus("Call ended · History saved");
        } catch (saveError) {
          console.warn("Could not save call history:", saveError);
          setStatus("Call ended · History could not be saved");
          setError(
            "The call ended, but its history could not be saved.",
          );
        }

        callStartedAtRef.current = null;
      } else {
        setStatus("Call ended");
      }

      setIsConnected(false);
      setIsStarting(false);
      setStartedAt(null);
    });

    vapi.on("message", (message) => {
      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        (message.role === "user" ||
          message.role === "assistant") &&
        typeof message.transcript === "string" &&
        message.transcript.trim()
      ) {
        const entry: TranscriptEntry = {
          role: message.role as "user" | "assistant",
          text: message.transcript.trim(),
        };

        transcriptRef.current = [
          ...transcriptRef.current,
          entry,
        ];

        setTranscript([...transcriptRef.current]);
      }
    });

    vapi.on("error", (event) => {
      console.warn("Vapi call error:", event);

      setError(
        event instanceof Error
          ? event.message
          : "The voice connection encountered an error. Please try again.",
      );

      setIsStarting(false);
      setStatus("Connection error");
    });

    return () => {
      vapi.removeAllListeners();

      void vapi.stop().catch((stopError) => {
        console.warn("Vapi cleanup:", stopError);
      });

      vapiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isConnected || startedAt === null) return;

    const interval = window.setInterval(() => {
      setElapsed(
        Math.floor((Date.now() - startedAt) / 1000),
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isConnected, startedAt]);

  async function startCall() {
    if (!publicKey || !assistantId || !vapiRef.current) {
      setError(
        "Vapi credentials are missing. Check your .env.local file and restart the development server.",
      );
      return;
    }

    // Load the customer prepared on the dashboard.
    customerNameRef.current = "Voice demo";

    try {
      const savedCustomer = sessionStorage.getItem(
        "sankar-current-customer",
      );

      if (savedCustomer) {
        const customer = JSON.parse(
          savedCustomer,
        ) as PreparedCustomer;

        if (
          typeof customer.name === "string" &&
          customer.name.trim()
        ) {
          customerNameRef.current = customer.name.trim();
        }

        // Consume the prepared customer for this call.
        sessionStorage.removeItem("sankar-current-customer");
      }
    } catch (customerError) {
      console.warn(
        "Could not load customer details:",
        customerError,
      );
    }

    setError("");
    setTranscript([]);
    transcriptRef.current = [];
    setElapsed(0);
    setIsStarting(true);
    setStatus("Connecting to your assistant...");

    try {
      await vapiRef.current.start(assistantId);
    } catch (startError) {
      console.error("Unable to start Vapi call:", startError);
      setIsStarting(false);
      setStatus("Unable to connect");

      setError(
        startError instanceof Error
          ? startError.message
          : "Could not start the call. Check microphone permission and Vapi settings.",
      );
    }
  }

  function endCall() {
    if (vapiRef.current) {
      void vapiRef.current.stop().catch((stopError) => {
        console.warn("Could not stop Vapi call:", stopError);
      });
    }
  }

  function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <Bot size={23} />
            </div>

            <div>
              <h2 className="font-bold">Sankar AI</h2>
              <p className="text-xs text-slate-500">
                LeadFlow CRM Sales Assistant
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center py-10 text-center">
            <div
              className={`relative flex h-36 w-36 items-center justify-center rounded-full ${
                isConnected
                  ? "bg-indigo-100 ring-8 ring-indigo-50"
                  : "bg-slate-100"
              }`}
            >
              {isConnected && (
                <span className="absolute inset-0 animate-ping rounded-full bg-indigo-200 opacity-40" />
              )}

              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-200">
                <Bot size={42} />
              </div>
            </div>

            <h3 className="mt-7 text-xl font-bold">
              {isConnected
                ? "You're connected"
                : isStarting
                  ? "Connecting..."
                  : "Ready to talk?"}
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              {isConnected
                ? "Talk naturally in English, Hindi or Hinglish."
                : "Start a live conversation with your AI sales assistant."}
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected
                    ? "bg-emerald-500"
                    : isStarting
                      ? "animate-pulse bg-amber-500"
                      : "bg-slate-300"
                }`}
              />
              {status}
            </div>

            <div className="mt-7 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <Clock3 size={17} className="text-slate-500" />

              <span className="font-mono text-lg font-semibold tabular-nums">
                {formatDuration(elapsed)}
              </span>

              <span className="text-xs text-slate-400">
                call duration
              </span>
            </div>

            {!isConnected ? (
              <button
                onClick={startCall}
                disabled={isStarting}
                className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Phone size={18} />
                )}

                {isStarting
                  ? "Connecting..."
                  : "Start voice call"}
              </button>
            ) : (
              <button
                onClick={endCall}
                className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                <PhoneOff size={18} />
                End call
              </button>
            )}

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
              Your browser may request microphone access. Use the
              call only after the participant has agreed to speak.
            </p>
          </div>
        </section>

        <section className="flex min-h-120 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-bold">Live transcript</h2>
              <p className="mt-1 text-xs text-slate-500">
                Conversation text appears as turns are transcribed.
              </p>
            </div>

            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {isConnected ? (
                <CheckCircle2 size={13} />
              ) : (
                <Mic size={13} />
              )}

              {isConnected ? "LIVE" : "STANDBY"}
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {transcript.length === 0 ? (
              <div className="flex min-h-85 flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <Mic size={23} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  No conversation yet
                </p>

                <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">
                  Start a call and the recognized customer and
                  assistant messages will appear here.
                </p>
              </div>
            ) : (
              transcript.map((entry, index) => (
                <div
                  key={`${index}-${entry.role}`}
                  className={`flex gap-3 ${
                    entry.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      entry.role === "assistant"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {entry.role === "assistant" ? (
                      <Bot size={16} />
                    ) : (
                      <UserRound size={16} />
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      entry.role === "assistant"
                        ? "rounded-tl-sm bg-slate-50 text-slate-700"
                        : "rounded-tr-sm bg-indigo-600 text-white"
                    }`}
                  >
                    <p className="mb-1 text-[10px] font-semibold opacity-70">
                      {entry.role === "assistant"
                        ? "Sankar AI"
                        : "You"}
                    </p>

                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {entry.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-[11px] leading-5 text-slate-400">
              Only finalized transcript turns are displayed.
              Call transcripts and duration are saved locally in
              this browser. Recordings are not saved yet.
            </p>
          </div>
        </section>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              Voice connection issue
            </p>

            <p className="mt-1 wrap-break-words leading-6">
              {error}
            </p>
          </div>

          <button
            onClick={() => setError("")}
            className="text-xs font-semibold text-rose-700"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
