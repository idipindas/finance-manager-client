import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = 'AIzaSyCfB6V5R0egpEk8MH8mJHk5kEu6-hurLmg';
if (!API_KEY) {
  console.error("❌ VITE_GEMINI_API_KEY env var not set. Run: VITE_GEMINI_API_KEY=<your-key> node test/test-gemini.mjs");
  process.exit(1);
}

const FALLBACK_MODELS = [
  "gemini-3.1-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash-8b",
];

const PROMPT = `This is a Google Pay (GPay) UPI transaction receipt screenshot from India.
Extract ONLY the following fields and respond with valid JSON only — no markdown, no explanation, no code block:
{
  "amount": <number — the rupee amount paid, digits only, no commas or symbols>,
  "merchant": <string — name of the person or business paid>,
  "date": <string — date of transaction in YYYY-MM-DD format; use today if unclear>,
  "category": <string — best match from: Food, Transport, Shopping, Entertainment, Bills, Health, Fuel, Groceries, Recharge, Education, Other>,
  "description": <string — one short sentence describing the transaction>
}`;

async function callModel(model, base64, mimeType) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: base64 } }, { text: PROMPT }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
    }),
  });

  if (res.status === 503 || res.status === 429 || res.status === 404) throw new Error(`model_busy:${res.status}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${model}: ${await res.text()}`);

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function run() {
  const imgPath = join(__dirname, "test-img.jpeg");
  const imgBuffer = readFileSync(imgPath);
  const base64 = imgBuffer.toString("base64");
  const mimeType = "image/jpeg";

  console.log(`\n📄 Test image: ${imgPath}`);
  console.log(`📦 Size: ${(imgBuffer.length / 1024).toFixed(1)} KB\n`);

  let lastError = null;

  for (const model of FALLBACK_MODELS) {
    process.stdout.write(`🤖 Trying ${model}... `);
    try {
      const text = await callModel(model, base64, mimeType);
      console.log(`✅ success\n`);

      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      console.log("─────────────────────────────────");
      console.log("📊 Extracted Data (JSON):");
      console.log("─────────────────────────────────");
      console.log(JSON.stringify(parsed, null, 2));
      console.log("─────────────────────────────────");
      console.log(`\n✅ Used model: ${model}`);
      return;
    } catch (err) {
      lastError = err;
      if (err.message.startsWith("model_busy")) {
        console.log(`⚠️  busy (${err.message.split(":")[1]}) — trying fallback`);
      } else {
        console.log(`❌ error: ${err.message}`);
        break;
      }
    }
  }

  console.error("\n❌ All models failed:", lastError?.message);
  process.exit(1);
}

run();
