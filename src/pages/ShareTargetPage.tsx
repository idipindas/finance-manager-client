import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Upload,
  ArrowLeft,
  AlertCircle,
  Receipt,
  IndianRupee,
  Store,
  CalendarDays,
  Tag,
  FileText,
} from "lucide-react";
import AddExpenseForm from "@/components/forms/AddExpenseForm";
import Spinner from "@/components/ui/Spinner";
import { extractReceiptData, type ReceiptData } from "@/api/gemini";

type Stage = "idle" | "analyzing" | "ready" | "error";

interface ExtractedField {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}

export default function ShareTargetPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ReceiptData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Read from service-worker cache (Android share flow) ───────────────────
  useEffect(() => {
    let objectUrl: string | null = null;

    async function readFromCache() {
      try {
        const cache = await caches.open("share-target-cache");
        const metaRes = await cache.match("/share-target-meta");
        const imgRes = await cache.match("/share-target-receipt");
        if (!metaRes) return; // no pending share — stay on idle

        const meta = (await metaRes.json()) as {
          hasImage: boolean;
          title: string;
          text: string;
        };

        if (meta.hasImage && imgRes) {
          const blob = await imgRes.blob();
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
          await runGemini(blob);
          await cache.delete("/share-target-receipt");
        } else if (meta.text) {
          const parsed = parseGPayText(meta.text);
          setExtracted(parsed);
          setStage("ready");
        }
        await cache.delete("/share-target-meta");
      } catch {
        // cache read failed silently — user can upload manually
      }
    }

    readFromCache();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // ── Run Gemini on a blob ──────────────────────────────────────────────────
  async function runGemini(blob: Blob) {
    setStage("analyzing");
    try {
      const data = await extractReceiptData(blob);
      setExtracted(data);
      setStage("ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "AI extraction failed");
      setStage("error");
    }
  }

  // ── Manual file upload (for browser testing) ─────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setExtracted(null);
    setStage("analyzing");
    runGemini(file);
  }

  // ── Extracted fields config ───────────────────────────────────────────────
  const fields: ExtractedField[] = extracted
    ? [
        {
          icon: <IndianRupee size={15} />,
          label: "Amount",
          value: `₹${extracted.amount.toLocaleString("en-IN")}`,
          color: "text-expense",
        },
        {
          icon: <Store size={15} />,
          label: "Merchant",
          value: extracted.merchant || "—",
        },
        {
          icon: <CalendarDays size={15} />,
          label: "Date",
          value: extracted.date,
        },
        {
          icon: <Tag size={15} />,
          label: "Category",
          value: extracted.category,
          color: "text-accent",
        },
        {
          icon: <FileText size={15} />,
          label: "Description",
          value: extracted.description || "—",
        },
      ]
    : [];

  return (
    <div className="min-h-dvh bg-bg-base flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-border sticky top-0 bg-bg-base z-10">
        <button
          onClick={() => navigate("/")}
          className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-xl hover:bg-bg-elevated"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-violet flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <h1 className="text-base font-bold text-text-primary font-heading">
            Receipt Scanner
          </h1>
        </div>
        {stage === "idle" && (
          <button
            onClick={() => fileRef.current?.click()}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-accent border border-accent/30 px-3 py-1.5 rounded-full hover:bg-accent/10 transition-colors"
          >
            <Upload size={13} /> Upload receipt
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5">

        {/* ── Idle: no share pending ── */}
        {stage === "idle" && !imageUrl && (
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-card py-16 gap-4 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Receipt size={26} className="text-accent" />
            </div>
            <div className="text-center">
              <p className="text-text-primary font-medium">Share a GPay receipt</p>
              <p className="text-text-muted text-sm mt-1">
                Or tap here to upload a screenshot
              </p>
            </div>
          </div>
        )}

        {/* ── Receipt image — always shown once available ── */}
        {imageUrl && (
          <div className="rounded-card overflow-hidden border border-border bg-bg-card">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider px-4 pt-3 pb-2">
              Receipt
            </p>
            <img
              src={imageUrl}
              alt="GPay receipt"
              className="w-full object-contain max-h-80"
            />
          </div>
        )}

        {/* ── Analyzing spinner ── */}
        {stage === "analyzing" && (
          <div className="bg-bg-card border border-border rounded-card px-5 py-6 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl gradient-violet flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <Spinner className="absolute -top-1 -right-1 w-4 h-4" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-medium">
                Analyzing with Gemini AI…
              </p>
              <p className="text-text-muted text-xs mt-0.5">
                Extracting amount, merchant & date
              </p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {stage === "error" && (
          <div className="bg-expense/10 border border-expense/20 rounded-card px-4 py-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-expense flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-expense text-sm font-medium">Extraction failed</p>
              <p className="text-text-muted text-xs mt-0.5">{errorMsg}</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-accent text-xs mt-2 hover:underline"
              >
                Try a different image →
              </button>
            </div>
          </div>
        )}

        {/* ── Extracted JSON data card ── */}
        {stage === "ready" && extracted && (
          <>
            <div className="bg-bg-card border border-border rounded-card overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-accent/5">
                <Sparkles size={14} className="text-accent" />
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Extracted Data
                </span>
              </div>

              {/* Field rows */}
              <div className="divide-y divide-border">
                {fields.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <span className="text-text-muted flex-shrink-0">{f.icon}</span>
                    <span className="text-xs text-text-muted w-20 flex-shrink-0">
                      {f.label}
                    </span>
                    <span
                      className={`text-sm font-medium flex-1 ${
                        f.color ?? "text-text-primary"
                      }`}
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Raw JSON toggle */}
              <details className="border-t border-border">
                <summary className="px-4 py-2.5 text-xs text-text-muted cursor-pointer hover:text-text-primary select-none list-none flex items-center justify-between">
                  <span>View raw JSON</span>
                  <span className="opacity-50">›</span>
                </summary>
                <pre className="px-4 pb-4 pt-2 text-xs text-accent font-mono overflow-x-auto bg-bg-base/50 leading-relaxed">
                  {JSON.stringify(extracted, null, 2)}
                </pre>
              </details>
            </div>

            {/* ── Pre-filled expense form ── */}
            <div className="bg-bg-card border border-border rounded-card p-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                Review & Save as Expense
              </p>
              <AddExpenseForm
                onSuccess={() => navigate("/")}
                prefill={{
                  amount: extracted.amount,
                  category: extracted.category,
                  description: extracted.merchant
                    ? `${extracted.merchant}${extracted.description ? " — " + extracted.description : ""}`
                    : extracted.description,
                  date: extracted.date,
                }}
              />
            </div>

            {/* Scan another */}
            <button
              onClick={() => {
                setStage("idle");
                setImageUrl(null);
                setExtracted(null);
                fileRef.current?.click();
              }}
              className="w-full text-center text-sm text-text-muted hover:text-accent transition-colors py-2"
            >
              Scan another receipt
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Fallback: parse plain GPay text ──────────────────────────────────────────
function parseGPayText(text: string): ReceiptData {
  const today = new Date().toISOString().split("T")[0];
  const amountMatch = text.match(/(?:₹|Rs\.?\s*)([0-9,]+(?:\.[0-9]{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;
  const merchantMatch = text.match(
    /(?:paid to|sent to|to)\s+([A-Za-z0-9 &.'-]+?)(?:\n|via|on|,|$)/i
  );
  const merchant = merchantMatch ? merchantMatch[1].trim() : "";
  const dateMatch = text.match(
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i
  );
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const date = dateMatch
    ? `${dateMatch[3]}-${months[dateMatch[2].toLowerCase().slice(0, 3)]}-${dateMatch[1].padStart(2, "0")}`
    : today;
  return {
    amount,
    merchant,
    date,
    category: "Other",
    description: merchant ? `Payment to ${merchant}` : text.slice(0, 80),
  };
}
