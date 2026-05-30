import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Common names dictionary for highly accurate local transliteration fallback
const COMMON_NAMES: Record<string, string> = {
  "md": "মোঃ",
  "md.": "মোঃ",
  "mst": "মোছাঃ",
  "mst.": "মোছাঃ",
  "mrs": "মিসেস",
  "mrs.": "মিসেস",
  "mr": "জনাব",
  "mr.": "জনাব",
  "mohammad": "মোহাম্মদ",
  "muhammad": "মোহাম্মদ",
  "rahim": "রহিম",
  "karim": "করিম",
  "mia": "মিয়া",
  "miah": "মিয়া",
  "ali": "আলী",
  "islam": "ইসলাম",
  "hasan": "হাসান",
  "hassan": "হাসান",
  "hossain": "হোসেন",
  "husein": "হোসেন",
  "hussein": "হোসেন",
  "shahin": "শাহীন",
  "alam": "আলম",
  "rahman": "রহমান",
  "ahmed": "আহমেদ",
  "ahmad": "আহমেদ",
  "chowdhury": "চৌধুরী",
  "khan": "খান",
  "begum": "বেগম",
  "sultana": "সুলতানা",
  "akter": "আক্তার",
  "aktar": "আক্তার",
  "uddin": "উদ্দিন",
  "al": "আল",
  "sarker": "সরকার",
  "sarkar": "সরকার",
  "das": "দাস",
  "roy": "রায়",
  "ray": "রায়",
  "sufian": "সুফিয়ান",
  "kabir": "কবির",
  "iqbal": "ইকবাল",
  "siddique": "সিদ্দিকী",
  "asif": "আসিফ",
  "sheikh": "শেখ",
  "seikh": "শেখ",
  "talukder": "তালুকদার",
  "talukdar": "তালুকদার",
  "gazi": "গাজী",
  "ghazi": "গাজী",
  "bhuiyan": "ভূঁইয়া",
  "bhuyan": "ভূঁইয়া",
  "howlader": "হাওলাদার",
  "patwary": "পাটোয়ারী",
  "patwari": "পাটোয়ারী",
  "munshi": "মুন্সী",
  "majumder": "মজুমদার",
  "mazumder": "মজুমদার",
  "ahsan": "আহসান",
  "amin": "আমিন",
  "kamal": "কামাল",
  "sajid": "সাজিদ",
  "arif": "আরিফ",
  "monir": "মনির",
  "rubel": "রুবেল",
  "sohel": "সোহেল",
  "rony": "রনি",
  "tariq": "তারেক",
  "tareq": "তারেক",
  "selim": "সেলিম",
  "reza": "রেজা",
  "faisal": "ফয়সাল",
  "anwar": "আনোয়ার",
  "mamun": "মামুন",
  "abu": "আবু",
  "abul": "আবুল",
  "kalam": "কালাম"
};

function transliteratePhonetic(word: string): string {
  const clean = word.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  if (!clean) return "";

  const mappings: [string, string][] = [
    ["kh", "খ"],
    ["ch", "চ"],
    ["sh", "শ"],
    ["ph", "ফ"],
    ["th", "থ"],
    ["bh", "ভ"],
    ["gh", "ঘ"],
    ["jh", "ঝ"],
    ["dh", "ধ"],
    
    ["b", "ব"],
    ["c", "চ"],
    ["d", "দ"],
    ["f", "ফ"],
    ["g", "গ"],
    ["h", "হ"],
    ["j", "জ"],
    ["k", "ক"],
    ["l", "ল"],
    ["m", "ম"],
    ["n", "ন"],
    ["p", "প"],
    ["r", "র"],
    ["s", "স"],
    ["t", "ত"],
    ["v", "ভ"],
    ["w", "ও"],
    ["z", "জ"],
    ["y", "ই"],
  ];

  let result = "";
  let i = 0;
  const isVowel = (char: string) => "aeiouy".includes(char);

  while (i < clean.length) {
    const double = clean.slice(i, i + 2);
    const char = clean[i];

    if (double === "ee" || double === "oo" || ["kh", "ch", "sh", "ph", "th", "bh", "gh", "jh", "dh"].includes(double)) {
      if (double === "ee") {
        result += i === 0 ? "ই" : "ী";
      } else if (double === "oo") {
        result += i === 0 ? "উ" : "ূ";
      } else {
        const map = mappings.find(m => m[0] === double);
        if (map) result += map[1];
      }
      i += 2;
      continue;
    }

    if (isVowel(char)) {
      const start = i === 0;
      if (char === "a") {
        result += start ? "আ" : "া";
      } else if (char === "e") {
        result += start ? "এ" : "ে";
      } else if (char === "i") {
        result += start ? "ই" : "ি";
      } else if (char === "o") {
        result += start ? "ও" : "ো";
      } else if (char === "u") {
        result += start ? "উ" : "ু";
      } else if (char === "y") {
        result += "য়";
      }
      i += 1;
    } else {
      const map = mappings.find(m => m[0] === char);
      if (map) {
        result += map[1];
      }
      i += 1;
    }
  }

  return result;
}

function fallbackTransliterate(text: string): string {
  const words = text.split(/\s+/);
  const resultWords = words.map(word => {
    const cleanWord = word.toLowerCase().trim();
    if (COMMON_NAMES[cleanWord]) {
      return COMMON_NAMES[cleanWord];
    }
    const strippedWord = cleanWord.replace(/\.$/, "");
    if (COMMON_NAMES[strippedWord]) {
      return COMMON_NAMES[strippedWord];
    }
    return transliteratePhonetic(word);
  });
  return resultWords.filter(Boolean).join(" ");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/transliterate", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Transliterate the following English name to Bengali. Only return the Bengali name, no extra text: "${text}"`,
      });

      const translatedText = response.text?.trim();
      res.json({ result: translatedText });
    } catch (error) {
      // Catching Gemini API error (including permission/leak issues) and falling back gracefully
      console.warn("Gemini API error during transliteration. Falling back to phonetic converter:", error);
      const fallbackResult = fallbackTransliterate(text);
      res.json({ result: fallbackResult, fallbackUsed: true });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // In Express v4, use app.get('*', ...)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
