import { RawFinding } from "../scanner/types";
import { GoogleGenAI } from "@google/genai";

export interface TranslatedFinding extends RawFinding {
  plain_explanation: string;
  risk_scenario: string;
  urgency: "fix before real users see this" | "fix this week" | "worth cleaning up, not urgent";
  fix_prompt: string;
  status: "new" | "persisting" | "fixed" | "accepted";
}

const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest"
];

function normalizeUrgency(urgency?: string): TranslatedFinding["urgency"] {
  const lower = (urgency || "").toLowerCase();
  if (lower.includes("before real users") || lower.includes("critical") || lower.includes("immediate") || lower.includes("high")) {
    return "fix before real users see this";
  }
  if (lower.includes("week") || lower.includes("medium")) {
    return "fix this week";
  }
  return "worth cleaning up, not urgent";
}

function generateSmartFallback(finding: RawFinding): TranslatedFinding {
  let explanation = `A potential security issue regarding ${finding.category} was detected in ${finding.file} at line ${finding.line}.`;
  let risk = `Attackers or unauthorized users could potentially exploit this to access unauthorized resources or cause unintended behavior.`;
  let urgency: TranslatedFinding["urgency"] = "fix this week";
  let fixPrompt = `Please review ${finding.file} around line ${finding.line}. Resolve the ${finding.category} issue by following secure coding best practices and verifying environment variables/permissions.`;

  if (finding.category.toLowerCase().includes("secret") || finding.category.toLowerCase().includes("key")) {
    explanation = `Sensitive credentials or tokens appear to be exposed or stored insecurely in ${finding.file}.`;
    risk = `Anyone with access to this file or client bundle could steal the credentials to access third-party services on your behalf.`;
    urgency = "fix before real users see this";
    fixPrompt = `In ${finding.file} at line ${finding.line}, remove the hardcoded secret and load it safely from server-side environment variables instead.`;
  } else if (finding.category.toLowerCase().includes("rate limit")) {
    explanation = `The endpoint in ${finding.file} does not appear to enforce rate limiting on incoming requests.`;
    risk = `Bad actors or automated scripts could flood this endpoint with requests, exhausting server resources or brute-forcing authentication.`;
    urgency = "fix this week";
    fixPrompt = `Add rate limiting middleware (such as Upstash Redis or memory-based rate limiting) to the handler in ${finding.file} around line ${finding.line}.`;
  } else if (finding.category.toLowerCase().includes("cors")) {
    explanation = `Cross-Origin Resource Sharing (CORS) is configured to allow requests from any origin (*).`;
    risk = `Malicious websites visited by your users could make unauthorized browser requests to this API on their behalf.`;
    urgency = "fix before real users see this";
    fixPrompt = `In ${finding.file} at line ${finding.line}, restrict Access-Control-Allow-Origin headers to trusted origin domains instead of the wildcard '*'.`;
  } else if (finding.category.toLowerCase().includes("sql")) {
    explanation = `A database query in ${finding.file} uses string interpolation instead of parameterized queries.`;
    risk = `Attackers could inject malicious SQL commands into query inputs to read, alter, or delete entire database tables.`;
    urgency = "fix before real users see this";
    fixPrompt = `In ${finding.file} at line ${finding.line}, convert raw SQL interpolation into parameterized queries or use the ORM/query builder safely.`;
  }

  return {
    ...finding,
    plain_explanation: explanation,
    risk_scenario: risk,
    urgency,
    fix_prompt: fixPrompt,
    status: "new"
  };
}

export async function translateFinding(finding: RawFinding): Promise<TranslatedFinding> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateSmartFallback(finding);
  }

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
    const ai = new GoogleGenAI({ apiKey });

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        const rawText = response.text || "{}";
        // Extract JSON block even if model wraps with markdown
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.plain_explanation && !parsed.risk_scenario) continue;

        return {
          ...finding,
          plain_explanation: parsed.plain_explanation || `Security issue identified in ${finding.file}:${finding.line}`,
          risk_scenario: parsed.risk_scenario || `Potential unauthorized access or risk in ${finding.category}.`,
          urgency: normalizeUrgency(parsed.urgency),
          fix_prompt: parsed.fix_prompt || `Review and resolve the issue in ${finding.file} at line ${finding.line}.`,
          status: "new"
        };
      } catch (err: any) {
        console.warn(`Translation attempt with ${model} failed, trying fallback:`, err?.message || err);
      }
    }
  } catch (outerErr) {
    console.error("Critical error in translateFinding:", outerErr);
  }

  // Fallback to smart structured interpretation if API calls exhaust
  return generateSmartFallback(finding);
}
