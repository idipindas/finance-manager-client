const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

const FALLBACK_MODELS = [
  "gemini-3.1-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash-8b",
];

export interface ReceiptData {
  amount: number;
  merchant: string;
  date: string;
  category: string;
  description: string;
}

const PROMPT = `This is a Google Pay (GPay) UPI transaction receipt screenshot from India.
Extract ONLY the following fields and respond with valid JSON only — no markdown, no explanation, no code block:
{
  "amount": <number — the rupee amount paid, digits only, no commas or symbols>,
  "merchant": <string — name of the person or business paid>,
  "date": <string — date of transaction in YYYY-MM-DD format; use today if unclear>,
  "category": <string — best match from: Food, Transport, Shopping, Entertainment, Bills, Health, Fuel, Groceries, Recharge, Education, Other>,
  "description": <string — one short sentence describing the transaction>
}`;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function callModel(model: string, base64: string, mimeType: string): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: PROMPT },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
    }),
  });

  // 503 = overloaded, 429 = rate limit, 404 = model not available — all retriable
  if (res.status === 503 || res.status === 429 || res.status === 404) {
    throw new Error(`model_busy:${res.status}`);
  }
  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status} from ${model}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function parseText(text: string): ReceiptData {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<ReceiptData>;
  const today = new Date().toISOString().split("T")[0];
  return {
    amount: Number(parsed.amount) || 0,
    merchant: parsed.merchant ?? "",
    date: parsed.date ?? today,
    category: parsed.category ?? "Other",
    description: parsed.description ?? "",
  };
}

export async function extractReceiptData(imageBlob: Blob): Promise<ReceiptData> {
  const base64 = await blobToBase64(imageBlob);
  const mimeType = imageBlob.type || "image/jpeg";

  let lastError: Error | null = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const text = await callModel(model, base64, mimeType);
      return parseText(text);
    } catch (err) {
      lastError = err as Error;
      // Only continue to next model if this one was busy/rate-limited
      if (!(lastError.message.startsWith("model_busy"))) break;
      console.warn(`[Gemini] ${model} busy, trying next model…`);
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}
