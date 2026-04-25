/**
 * LLM provider abstraction. Prefers Anthropic (Claude Sonnet 4) if ANTHROPIC_API_KEY is set,
 * falls back to Gemini 2.5 Flash if GEMINI_API_KEY is set.
 * At least one must be present.
 */

export type LLMProvider = "anthropic" | "gemini";

function activeProvider(): LLMProvider {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GEMINI_API_KEY) return "gemini";
  throw new Error("Set ANTHROPIC_API_KEY or GEMINI_API_KEY in .env.local");
}

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export async function llmComplete(params: {
  system: string;
  messages: LLMMessage[];
  maxTokens?: number;
}): Promise<string> {
  const provider = activeProvider();

  if (provider === "anthropic") {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: params.maxTokens ?? 2048,
      system: params.system,
      messages: params.messages,
    });

    return response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  // Gemini fallback
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const contents = params.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: params.system,
      maxOutputTokens: params.maxTokens ?? 2048,
    },
  });

  return response.text ?? "";
}
