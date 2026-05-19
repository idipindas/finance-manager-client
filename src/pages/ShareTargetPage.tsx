import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ImageIcon, ChevronDown, ChevronUp, AlertCircle, ArrowLeft } from "lucide-react";
import AddExpenseForm from "@/components/forms/AddExpenseForm";
import Spinner from "@/components/ui/Spinner";
import { extractReceiptData, type ReceiptData } from "@/api/gemini";

type Stage = "loading" | "analyzing" | "ready" | "error" | "empty";

export default function ShareTargetPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("loading");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(false);
  const [extracted, setExtracted] = useState<ReceiptData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let objectUrl: string | null = null;

    async function init() {
      try {
        const cache = await caches.open("share-target-cache");
        const metaRes = await cache.match("/share-target-meta");
        const imgRes = await cache.match("/share-target-receipt");

        if (!metaRes) {
          setStage("empty");
          return;
        }

        const meta = await metaRes.json() as { hasImage: boolean; title: string; text: string };

        if (meta.hasImage && imgRes) {
          setStage("analyzing");
          const blob = await imgRes.blob();
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);

          // Analyze with Gemini
          const data = await extractReceiptData(blob);
          setExtracted(data);

          // Clean up cache after reading
          await cache.delete("/share-target-receipt");
          await cache.delete("/share-target-meta");

          setStage("ready");
        } else if (meta.text) {
          // Text-only share — parse what we can
          const parsed = parseGPayText(meta.text);
          setExtracted(parsed);
          await cache.delete("/share-target-meta");
          setStage("ready");
        } else {
          setStage("empty");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
        setStage("error");
      }
    }

    init();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-bg-base flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-border">
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
          <h1 className="text-base font-bold text-text-primary font-heading">Smart Receipt Scan</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">

        {/* Loading / Analyzing */}
        {(stage === "loading" || stage === "analyzing") && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl gradient-violet flex items-center justify-center shadow-lg shadow-accent/30">
                <Sparkles size={28} className="text-white" />
              </div>
              <Spinner className="absolute -top-1 -right-1 w-5 h-5 border-accent" />
            </div>
            <div className="text-center">
              <p className="text-text-primary font-medium">
                {stage === "loading" ? "Reading receipt…" : "Analyzing with AI…"}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {stage === "analyzing" ? "Extracting amount, merchant & date" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {stage === "error" && (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-expense/10 flex items-center justify-center">
              <AlertCircle size={22} className="text-expense" />
            </div>
            <div>
              <p className="text-text-primary font-medium">Could not read receipt</p>
              <p className="text-text-muted text-sm mt-1">{errorMsg}</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-accent text-sm hover:underline"
            >
              Go to dashboard →
            </button>
          </div>
        )}

        {/* Empty — no pending share */}
        {stage === "empty" && (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <ImageIcon size={22} className="text-accent" />
            </div>
            <div>
              <p className="text-text-primary font-medium">No receipt shared</p>
              <p className="text-text-muted text-sm mt-1">
                Share a GPay screenshot from your phone to auto-fill an expense
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-accent text-sm hover:underline"
            >
              Go to dashboard →
            </button>
          </div>
        )}

        {/* Ready — show extracted data + form */}
        {stage === "ready" && extracted && (
          <div className="space-y-5 fade-in">
            {/* Extracted summary pill */}
            <div className="bg-accent/10 border border-accent/20 rounded-card px-4 py-3 flex items-center gap-3">
              <Sparkles size={16} className="text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-accent font-medium">AI extracted from receipt</p>
                <p className="text-sm text-text-primary mt-0.5 truncate">
                  ₹{extracted.amount} · {extracted.merchant} · {extracted.category}
                </p>
              </div>
            </div>

            {/* Receipt image toggle */}
            {imageUrl && (
              <div className="bg-bg-card border border-border rounded-card overflow-hidden">
                <button
                  onClick={() => setShowImage((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon size={15} />
                    <span>View receipt image</span>
                  </div>
                  {showImage ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {showImage && (
                  <div className="px-3 pb-3">
                    <img
                      src={imageUrl}
                      alt="GPay receipt"
                      className="w-full rounded-xl object-contain max-h-72"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Pre-filled expense form */}
            <div className="bg-bg-card border border-border rounded-card p-4">
              <p className="text-xs font-medium text-text-muted mb-4 uppercase tracking-wider">
                Review & Save
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
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fallback: parse plain GPay text ──────────────────────────────────────────
function parseGPayText(text: string): ReceiptData {
  const today = new Date().toISOString().split("T")[0];

  // Match ₹1,234.56 or Rs 1234
  const amountMatch = text.match(/(?:₹|Rs\.?\s*)([0-9,]+(?:\.[0-9]{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

  // "paid to X" or "sent to X"
  const merchantMatch = text.match(/(?:paid to|sent to|to)\s+([A-Za-z0-9 &.'-]+?)(?:\n|via|on|,|$)/i);
  const merchant = merchantMatch ? merchantMatch[1].trim() : "";

  // Date like "15 Jan 2025" or "Jan 15, 2025"
  const dateMatch = text.match(
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i
  );
  let date = today;
  if (dateMatch) {
    const months: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const m = months[dateMatch[2].toLowerCase().slice(0, 3)];
    date = `${dateMatch[3]}-${m}-${dateMatch[1].padStart(2, "0")}`;
  }

  return {
    amount,
    merchant,
    date,
    category: "Other",
    description: merchant ? `Payment to ${merchant}` : text.slice(0, 80),
  };
}
