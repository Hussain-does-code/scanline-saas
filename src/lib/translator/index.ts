import { RawFinding } from "../scanner/types";
import { GoogleGenAI } from "@google/genai";

export interface TranslatedFinding extends RawFinding {
  plain_explanation: string;
  risk_scenario: string;
  urgency: "fix before real users see this" | "fix this week" | "worth cleaning up, not urgent";
  fix_prompt: string;
  status: "new" | "persisting" | "fixed" | "accepted";
}

// In Next.js, creating the instance requires GEMINI_API_KEY environment variable.
// We initialize it dynamically so it doesn't crash on build if missing.
export async function translateFinding(finding: RawFinding): Promise<TranslatedFinding> {
  const prompt = `You are Scanline, a calm and knowledgeable guide for people who build apps with AI coding tools and have no security background.

You will receive one raw technical finding: a category, a file, a line, and raw tool output. Return JSON with exactly these fields:

- plain_explanation: one sentence, zero jargon, what this actually is
- risk_scenario: one or two sentences, concrete and specific — what could a stranger actually do because of this, stated plainly
- urgency: one of "fix before real users see this" / "fix this week" / "worth cleaning up, not urgent"
- fix_prompt: a ready-to-paste instruction, written as if briefing a competent coding agent, that fixes this exact issue in this exact file and line — specific enough to paste directly into an AI coding tool with no further editing

Rules:
- Never use the words CVE, CWE, vector, payload, or exploit unless you immediately define them in plain language in the same sentence.
- Never inflate the urgency of a low-severity finding for drama.
- Never downplay a genuinely critical finding to sound reassuring.
- Be specific to the actual file and line, never generic.

Input Finding:
Category: ${finding.category}
File: ${finding.file}
Line: ${finding.line}
Output: ${finding.raw_output}
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Fallback for when API key isn't provided by the founder yet
      return {
        ...finding,
        plain_explanation: `(Mock) Found ${finding.category} in your code.`,
        risk_scenario: "(Mock) A stranger could use this to cause harm.",
        urgency: "fix before real users see this",
        fix_prompt: `(Mock) Remove the ${finding.category} from ${finding.file} at line ${finding.line}.`,
        status: "new"
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const rawText = response.text || "{}";
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanText);
    
    return {
      ...finding,
      plain_explanation: parsed.plain_explanation || "Unknown issue",
      risk_scenario: parsed.risk_scenario || "Unknown risk",
      urgency: parsed.urgency || "worth cleaning up, not urgent",
      fix_prompt: parsed.fix_prompt || "No fix provided",
      status: "new"
    };
  } catch (error: any) {
    console.error("Translation error:", error);
    return {
      ...finding,
      plain_explanation: `Failed to translate finding. Error: ${error?.message || String(error)}`,
      risk_scenario: "Unknown risk due to translation failure.",
      urgency: "fix this week",
      fix_prompt: "Manually review this finding.",
      status: "new"
    };
  }
}
