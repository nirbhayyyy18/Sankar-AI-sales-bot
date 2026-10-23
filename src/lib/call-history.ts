
export type CallRecord = {
  id: string;
  customerName: string;
  date: string;
  duration: number;
  status:
    | "Interested"
    | "Converted"
    | "Follow-up Required"
    | "Demo Requested"
    | "Not Interested"
    | "No Response";
  transcript: {
    role: "user" | "assistant";
    text: string;
  }[];
  summary: string;
};

const STORAGE_KEY = "sankar-ai-call-history";

export function getCallHistory(): CallRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CallRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveCallRecord(record: CallRecord): void {
  if (typeof window === "undefined") return;

  const existing = getCallHistory();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([record, ...existing]),
  );
}
