
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import VoiceCall from "@/components/voice-call";

export default function CallPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 sm:px-7 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <ShieldCheck size={14} />
            Browser voice demo
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI Voice Workspace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Test a real-time conversation with Sankar AI. Allow microphone
            access when prompted, then speak naturally.
          </p>
        </div>

        <VoiceCall />

        <p className="mt-7 text-center text-xs leading-5 text-slate-400">
          Sankar AI Sales Assistant · LeadFlow CRM demo
        </p>
      </div>
    </main>
  );
}
