const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const MODEL = "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

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
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function extractReceiptData(imageBlob: Blob): Promise<ReceiptData> {
  const base64 = await blobToBase64(imageBlob);
  const mimeType = imageBlob.type || "image/jpeg";

  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const json = await res.json();
  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip any accidental markdown fences
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as Partial<ReceiptData>;
    const today = new Date().toISOString().split("T")[0];
    return {
      amount: Number(parsed.amount) || 0,
      merchant: parsed.merchant ?? "",
      date: parsed.date ?? today,
      category: parsed.category ?? "Other",
      description: parsed.description ?? "",
    };
  } catch {
    throw new Error("Could not parse Gemini response as JSON");
  }
}
