"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Headphones,
  LayoutDashboard,
  Menu,
  Mic,
  MoreHorizontal,
  Phone,
  PhoneCall,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCallHistory, type CallRecord } from "@/lib/call-history";

const initialCalls = [
  {
    name: "Rahul Sharma",
    initials: "RS",
    company: "Sharma Electronics",
    date: "Today, 11:42 AM",
    duration: "04:32",
    status: "Interested",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Priya Mehta",
    initials: "PM",
    company: "Mehta Retail Group",
    date: "Today, 10:18 AM",
    duration: "06:14",
    status: "Demo Requested",
    color: "bg-violet-100 text-violet-700",
  },
  {
    name: "Amit Patel",
    initials: "AP",
    company: "Patel Distributors",
    date: "Today, 09:35 AM",
    duration: "02:48",
    status: "Follow-up Required",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "Sneha Kapoor",
    initials: "SK",
    company: "Kapoor Ventures",
    date: "Yesterday, 04:20 PM",
    duration: "05:06",
    status: "Converted",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Vikram Singh",
    initials: "VS",
    company: "Singh Enterprises",
    date: "Yesterday, 02:15 PM",
    duration: "01:12",
    status: "Not Interested",
    color: "bg-rose-100 text-rose-700",
  },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Call History", icon: PhoneCall },
  { label: "Contacts", icon: Users },
  { label: "AI Assistant", icon: Bot },
];

const statusStyles: Record<string, string> = {
  Interested: "bg-blue-50 text-blue-700",
  "Demo Requested": "bg-violet-50 text-violet-700",
  "Follow-up Required": "bg-amber-50 text-amber-700",
  Converted: "bg-emerald-50 text-emerald-700",
  "Not Interested": "bg-rose-50 text-rose-700",
  "No Response": "bg-gray-100 text-gray-600",
};

type DisplayCall = {
  id: string;
  name: string;
  initials: string;
  company: string;
  date: string;
  duration: string;
  status: string;
  color: string;
  record: CallRecord | null;
};

export default function Home() {
  const router = useRouter();

  const [activeNav, setActiveNav] = useState("Overview");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settings, setSettings] = useState({
    assistantName: "Sankar AI Sales Assistant",
    businessName: "LeadFlow CRM",
    language: "English",
    voicePreference: "Elliot",
    saveTranscripts: true,
  });

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notice, setNotice] = useState("");
  const [savedCalls, setSavedCalls] = useState<CallRecord[]>([]);
  const [selectedCall, setSelectedCall] =
    useState<CallRecord | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSavedCalls(getCallHistory());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // Load dashboard preferences from localStorage
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const storedSettings = localStorage.getItem(
          "sankar-dashboard-settings",
        );

        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);

          setSettings({
            assistantName:
              typeof parsedSettings.assistName === "string"
                ? parsedSettings.assistName
                : "Sankar AI Sales Assistant",
            businessName:
              typeof parsedSettings.bussinessName === "string"
                ? parsedSettings.bussinessName
                : "Sankar Group CRM",
            language:
              typeof parsedSettings.language === "string"
                ? parsedSettings.language
                : "English",
            voicePreference:
              typeof parsedSettings.voicePreference === "string"
                ? parsedSettings.voicePreference
                : "Elliot",
            saveTranscripts:
              typeof parsedSettings.saveTranscripts === "string"
                ? parsedSettings.saveTranscripts
                : true
          });
        }
      } catch {
        console.error("Could not load dashboard settings.")
      }
    }, 0)

    return () => window.clearTimeout(timeoutId);
  }, []);

  function saveSettings() {
    try {
      localStorage.setItem(
        "sankar-dashboard-settings",
        JSON.stringify(settings),
      );

      setSettingsSaved(true);
      window.setTimeout(() => setSettingsSaved(false), 2500);
    } catch {
      setNotice(
        "Could not save settings in this browser. Please try again.",
      );
    }
  }

  function clearCallHistory() {
    const confirmed = window.confirm(
      "Delete all locally saved call history? This action cannot be undone.",
    );

    if (!confirmed) return;

    localStorage.removeItem("sankar-ai-call-history");
    setSavedCalls([]);
    setSelectedCall(null);
    setShowSettings(false);
    setNotice("Local call history cleared.");
  }

  const displayedCalls: DisplayCall[] =
    savedCalls.length > 0
      ? savedCalls.map((call) => ({
          id: call.id,
          name: call.customerName,
          initials:
            call.customerName
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "VC",
          company: "LeadFlow CRM demo",
          date: new Date(call.date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          duration: `${String(
            Math.floor(call.duration / 60),
          ).padStart(2, "0")}:${String(
            call.duration % 60,
          ).padStart(2, "0")}`,
          status: call.status,
          color: "bg-indigo-100 text-indigo-700",
          record: call,
        }))
      : initialCalls.map((call, index) => ({
          ...call,
          id: `demo-${index}`,
          record: null,
        }));

  const filteredCalls = displayedCalls.filter((call) =>
    `${call.name} ${call.company} ${call.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const totalCalls = savedCalls.length;

  const conversations = savedCalls.filter(
    (call) => call.transcript.length > 0,
  ).length;

  const convertedCalls = savedCalls.filter(
    (call) => call.status === "Converted",
  ).length;

  const conversionRate =
    totalCalls > 0
      ? Math.round((convertedCalls / totalCalls) * 100)
      : 0;

  const totalSeconds = savedCalls.reduce(
    (total, call) => total + call.duration,
    0,
  );

  const totalTalkTime = `${Math.floor(
    totalSeconds / 3600,
  )}h ${Math.floor((totalSeconds % 3600) / 60)}m`;

  const outcomeCounts = [
    {
      label: "Interested",
      count: savedCalls.filter(
        (call) => call.status === "Interested",
      ).length,
      color: "bg-indigo-500",
    },
    {
      label: "Converted",
      count: convertedCalls,
      color: "bg-emerald-500",
    },
    {
      label: "Follow-up",
      count: savedCalls.filter(
        (call) => call.status === "Follow-up Required",
      ).length,
      color: "bg-amber-500",
    },
    {
      label: "Demo Requested",
      count: savedCalls.filter(
        (call) => call.status === "Demo Requested",
      ).length,
      color: "bg-violet-400",
    },
  ];

  function startCall() {
    if (!customerName.trim()) {
      setNotice("Enter a customer name to prepare your call.");
      return;
    }

    try {
      sessionStorage.setItem(
        "sankar-current-customer",
        JSON.stringify({
          name: customerName.trim(),
          phone: customerPhone.trim(),
        }),
      );

      setShowCallModal(false);
      router.push("/call");
    } catch {
      setNotice(
        "Could not prepare customer details. Please try again.",
      );
    }
  }

  function openCallDetails(call: DisplayCall) {
    if (!call.record) {
      setNotice(
        "This is sample data. Make a real voice call to view its transcript.",
      );
      return;
    }

    setNotice("");
    setSelectedCall(call.record);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {mobileMenu && (
        <button
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Bot size={23} />
          </div>

          <div>
            <p className="text-[15px] font-bold tracking-tight">
              Sankar <span className="text-indigo-600">AI</span>
            </p>
            <p className="text-xs text-slate-500">
              Sales Assistant
            </p>
          </div>

          <button
            className="ml-auto rounded-lg p-1 text-slate-500 lg:hidden"
            onClick={() => setMobileMenu(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  setActiveNav(label);
                  setMobileMenu(false);
                  setNotice(
                    label === "Overview"
                      ? ""
                      : `${label} is not a separate page yet. Your saved calls are available below.`,
                  );
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition ${
                  activeNav === label
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {label}

                {label === "Call History" && (
                  <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                    {savedCalls.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
            Preferences
          </p>

          <button
            onClick={() => {
              setSettingsSaved(false);
              setShowSettings(true);
              setMobileMenu(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings2 size={18} strokeWidth={1.8} />
            Settings
          </button>

          <button
            onClick={() =>
              setNotice("Help documentation will be added soon.")
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <CircleHelp size={18} strokeWidth={1.8} />
            Help & Support
          </button>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-white p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <Sparkles size={18} />
            </div>

            <p className="text-sm font-semibold">
              AI-powered selling
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Turn conversations into opportunities, around the clock.
            </p>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Workspace ready
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              NT
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                Sales Workspace
              </p>
              <p className="truncate text-[11px] text-slate-500">
                Admin account
              </p>
            </div>

            <MoreHorizontal size={18} className="text-slate-400" />
          </div>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-slate-600">{activeNav}</span>
              </div>

              <h1 className="mt-1 truncate text-base font-bold tracking-tight sm:text-lg">
                {activeNav}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-700">
                System ready
              </span>
            </div>

            <button
              aria-label="Notifications"
              onClick={() => setNotice("You are all caught up.")}
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
            >
              <Activity size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <button
              onClick={() =>
                setNotice("Account menu will be connected later.")
              }
              className="flex items-center gap-2"
              aria-label="Account menu"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                NT
              </div>
              <ChevronDown
                size={14}
                className="hidden text-slate-400 sm:block"
              />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-375 px-4 py-7 sm:px-7 sm:py-8 lg:px-9">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-slate-500">
                Thursday, October 22, 2026
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-[28px]">
                Good afternoon 👋
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Here&apos;s what&apos;s happening with your sales conversations.
              </p>
            </div>

            <button
              onClick={() => {
                setNotice("");
                setShowCallModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Start new call
            </button>
          </div>

          {notice && (
            <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
              <p>{notice}</p>
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total calls"
              value={String(totalCalls)}
              detail="Saved in this browser"
              icon={Phone}
              iconStyle="bg-indigo-50 text-indigo-600"
            />

            <MetricCard
              label="Conversations"
              value={String(conversations)}
              detail="With transcript captured"
              icon={Users}
              iconStyle="bg-sky-50 text-sky-600"
            />

            <MetricCard
              label="Conversion rate"
              value={`${conversionRate}%`}
              detail="Based on saved call outcomes"
              icon={Target}
              iconStyle="bg-emerald-50 text-emerald-600"
            />

            <MetricCard
              label="Total talk time"
              value={totalTalkTime}
              detail="Across saved calls"
              icon={Clock3}
              iconStyle="bg-amber-50 text-amber-600"
            />
          </section>

          <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold">Call activity</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Recent saved call durations
                  </p>
                </div>
                <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500">
                  All saved calls
                </span>
              </div>

              {savedCalls.length > 0 ? (
                <div className="mt-7 space-y-5">
                  {savedCalls.slice(0, 7).map((call) => {
                    const maxDuration = Math.max(
                      ...savedCalls.map((item) => item.duration),
                      1,
                    );

                    const width = Math.max(
                      5,
                      (call.duration / maxDuration) * 100,
                    );

                    return (
                      <div key={call.id}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                          <span className="truncate font-medium text-slate-600">
                            {call.customerName}
                          </span>
                          <span className="shrink-0 text-slate-400">
                            {Math.floor(call.duration / 60)}m{" "}
                            {call.duration % 60}s
                          </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-7 flex min-h-48 flex-col items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
                  <Activity size={24} className="text-slate-400" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No saved calls yet
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Start a real voice call to see your call activity here.
                  </p>
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
                Saved call duration
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-sm font-bold">Lead outcomes</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Based on saved call statuses
                </p>
              </div>

              <div className="mt-7 flex items-center gap-5">
                <div className="relative h-36 w-36 shrink-0">
                  <svg
                    viewBox="0 0 120 120"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="14"
                    />

                    {(() => {
                      const circumference = 2 * Math.PI * 45;
                      let offset = 0;
                      const colors = [
                        "#6366f1",
                        "#10b981",
                        "#f59e0b",
                        "#a78bfa",
                      ];

                      return outcomeCounts.map((outcome, index) => {
                        const fraction =
                          totalCalls > 0
                            ? outcome.count / totalCalls
                            : 0;

                        const length = fraction * circumference;
                        const currentOffset = offset;
                        offset += length;

                        return (
                          <circle
                            key={outcome.label}
                            cx="60"
                            cy="60"
                            r="45"
                            fill="none"
                            stroke={colors[index]}
                            strokeWidth="14"
                            strokeDasharray={`${length} ${circumference - length}`}
                            strokeDashoffset={-currentOffset}
                          />
                        );
                      });
                    })()}
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">
                      {totalCalls}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Total calls
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  {outcomeCounts.map((outcome) => (
                    <Outcome
                      key={outcome.label}
                      label={outcome.label}
                      count={String(outcome.count)}
                      color={outcome.color}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-indigo-600" />
                  <span className="text-xs font-semibold">
                    Workspace insight
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {totalCalls > 0
                    ? `${savedCalls.filter((call) => call.status === "Follow-up Required").length} calls currently need follow-up. Review their transcripts to decide the next step.`
                    : "Complete a call to start tracking lead outcomes and follow-ups."}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h3 className="text-sm font-bold">Recent conversations</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Review your latest AI sales calls
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search conversations..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-56"
                  />
                </div>

                <button
                  onClick={() => setSearch("")}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <CalendarClock size={15} />
                  All calls
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Date & time</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Outcome</th>
                    <th className="px-5 py-3.5">Recording</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCalls.map((call) => (
                    <tr
                      key={call.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${call.color}`}
                          >
                            {call.initials}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {call.name}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {call.company}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {call.date}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <Clock3
                            size={13}
                            className="text-slate-400"
                          />
                          {call.duration}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            statusStyles[call.status] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {call.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            setNotice(
                              `Audio recording is not saved for ${call.name}. The transcript and duration are available in call details.`,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
                        >
                          <Play size={12} />
                          Play
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          aria-label={`View details for ${call.name}`}
                          onClick={() => openCallDetails(call)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredCalls.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-sm text-slate-400"
                      >
                        No conversations match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                Showing {filteredCalls.length} of {displayedCalls.length} conversations
                {savedCalls.length === 0 ? " (demo data)" : ""}
              </p>

              <button
                onClick={() => {
                  setActiveNav("Call History");
                  setNotice(
                    "Saved calls are stored in this browser. Multi-device history requires a backend database.",
                  );
                }}
                className="text-left text-xs font-semibold text-indigo-600 hover:text-indigo-800 sm:text-right"
              >
                View all conversations →
              </button>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Headphones size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">
                  AI voice assistant
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Speak with leads naturally and handle sales enquiries in real time.
                </p>
              </div>

              <button
                onClick={() => {
                  setNotice("");
                  setShowCallModal(true);
                }}
                className="shrink-0 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Configure
              </button>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">
                  Sales follow-ups
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Review saved transcripts to plan the next step with each prospect.
                </p>
              </div>

              <button
                onClick={() => {
                  setSearch("Follow-up Required");
                  setNotice(
                    "The conversation list is filtered to calls requiring follow-up.",
                  );
                  document
                    .querySelector("input[placeholder='Search conversations...']")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
                className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                View leads
              </button>
            </div>
          </section>

          <footer className="flex flex-col gap-2 py-7 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © 2026 Sankar AI Sales Assistant. Built for smarter conversations.
            </p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {savedCalls.length > 0
                ? "Live call data · Stored locally"
                : "Demo dashboard · Sample conversations"}
            </p>
          </footer>
        </main>
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSettings(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Settings2 size={22} />
                </div>
                <div>
                  <h2
                    id="settings-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    Settings
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage your Sankar AI dashboard preferences.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </header>

            <div className="space-y-7 p-6">
              {/* General settings */}
              <section>
                <h3 className="text-sm font-bold text-slate-900">
                  General
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Personalize the information shown in your dashboard.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Assistant name
                    <input
                      value={settings.assistantName}
                      onChange={(event) => {
                        setSettings({
                          ...settings,
                          assistantName: event.target.value,
                        });
                        setSettingsSaved(false);
                      }}
                      maxLength={100}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Business name
                    <input
                      value={settings.businessName}
                      onChange={(event) => {
                        setSettings({
                          ...settings,
                          businessName: event.target.value,
                        });
                        setSettingsSaved(false);
                      }}
                      maxLength={100}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                </div>
              </section>

              {/* Voice and language preferences */}
              <section className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-900">
                  Voice & language preferences
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  These are dashboard preferences and do not automatically
                  reconfigure your live Vapi assistant.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Preferred language
                    <select
                      value={settings.language}
                      onChange={(event) => {
                        setSettings({
                          ...settings,
                          language: event.target.value,
                        });
                        setSettingsSaved(false);
                      }}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Hinglish">Hinglish</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Preferred voice
                    <select
                      value={settings.voicePreference}
                      onChange={(event) => {
                        setSettings({
                          ...settings,
                          voicePreference: event.target.value,
                        });
                        setSettingsSaved(false);
                      }}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="Elliot">Elliot</option>
                      <option value="Other">Other / not specified</option>
                    </select>
                  </label>
                </div>
              </section>

              {/* Call preferences */}
              <section className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-900">
                  Call preferences
                </h3>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    checked={settings.saveTranscripts}
                    onChange={(event) => {
                      setSettings({
                        ...settings,
                        saveTranscripts: event.target.checked,
                      });
                      setSettingsSaved(false);
                    }}
                    className="mt-1 h-4 w-4 accent-indigo-600"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Save transcript preference
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      This preference is saved for now; it does not yet
                      disable transcript storage in the current call flow.
                    </span>
                  </span>
                </label>
              </section>

              {/* Data management */}
              <section className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                    <Settings2 size={18} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Data management
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Remove call records saved locally in this browser.
                      This does not delete data stored by Vapi.
                    </p>

                    <button
                      type="button"
                      onClick={clearCallHistory}
                      className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Clear call history
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
              <p className="text-sm text-emerald-700">
                {settingsSaved ? "Settings saved successfully." : ""}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={saveSettings}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Save changes
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}

      {/* CALL DETAILS MODAL */}
      {selectedCall && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCall(null);
            }
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Call details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedCall.customerName}
                </p>
              </div>

              <button
                onClick={() => setSelectedCall(null)}
                aria-label="Close call details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 sm:grid-cols-3 sm:p-6">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Duration</p>
                <p className="mt-1 font-semibold">
                  {Math.floor(selectedCall.duration / 60)}m{" "}
                  {selectedCall.duration % 60}s
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Outcome</p>
                <p className="mt-1 text-sm font-semibold">
                  {selectedCall.status}
                </p>
              </div>

              <div className="col-span-2 rounded-xl bg-slate-50 p-3 sm:col-span-1">
                <p className="text-xs text-slate-500">Date</p>
                <p className="mt-1 text-sm font-semibold">
                  {new Date(selectedCall.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <h3 className="mb-4 text-sm font-bold">
                Conversation transcript
              </h3>

              {selectedCall.transcript.length > 0 ? (
                <div className="space-y-4">
                  {selectedCall.transcript.map((entry, index) => (
                    <div
                      key={`${selectedCall.id}-${index}`}
                      className={`flex ${
                        entry.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                          entry.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <p className="mb-1 text-[10px] font-semibold opacity-70">
                          {entry.role === "user" ? "Customer" : "Sankar AI"}
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {entry.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                  No transcript was captured during this call.
                </p>
              )}

              <div className="mt-5 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-700">
                  Call summary
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {selectedCall.summary}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 p-4">
              <button
                onClick={() => setSelectedCall(null)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* START CALL MODAL */}
      {showCallModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowCallModal(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Mic size={22} />
              </div>

              <button
                onClick={() => setShowCallModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Start a new sales call
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add a prospect to prepare your AI-assisted conversation.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                startCall();
              }}
            >
              <div>
                <label
                  htmlFor="customerName"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  Customer name
                </label>
                <input
                  id="customerName"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="customerPhone"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  Phone number{" "}
                  <span className="font-normal text-slate-400">
                    (optional for demo)
                  </span>
                </label>
                <input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">
                <p className="flex items-center gap-2 font-semibold">
                  <Activity size={14} />
                  Voice assistant ready
                </p>
                <p className="mt-1">
                  Prepare the customer details, then continue to the live voice workspace.
                </p>
              </div>

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <PhoneCall size={16} />
                Prepare call
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  iconStyle,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  iconStyle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
        <MoreHorizontal size={17} className="text-slate-300" />
      </div>

      <p className="mt-5 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-[27px] font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
    </div>
  );
}

function Outcome({
  label,
  count,
  color,
}: {
  label: string;
  count: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
        <span className="truncate text-xs text-slate-500">{label}</span>
      </div>
      <span className="text-xs font-semibold text-slate-700">{count}</span>
    </div>
  );
}