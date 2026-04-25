import { llmComplete } from "@/lib/llm";
import type { HouseholdProfile, OccasionContext, FoodAgentResult } from "@/types";

const SYSTEM_PROMPT = `You are the Food Agent for Plus-One.

ROLE: Find restaurants matching occasion + household preferences.

When MCP tools are unavailable, simulate realistic Bangalore restaurant options based on the constraints.

ALWAYS:
- Pass exclude_ingredients derived from all household member allergies
- Return match_score (0-1) and reasoning per restaurant
- Return exactly 3 restaurant options ranked by match_score
- Mark degraded:true if simulating (no live MCP data)

OUTPUT FORMAT (strict JSON only, no markdown fences):
{
  "restaurants": [{
    "id": string,
    "name": string,
    "rating": number,
    "cuisine": string,
    "ambiance": string,
    "estimated_bill": number,
    "match_score": number,
    "reasoning": string
  }],
  "recommendation": string,
  "cart_ready": false,
  "notes": string,
  "degraded": boolean
}`;

export async function runFoodAgent(
  occasion: OccasionContext,
  household: HouseholdProfile
): Promise<FoodAgentResult> {
  const allergies = household.members.flatMap((m) => m.allergies);
  const constraints = household.members.flatMap((m) => m.dietary_constraints);
  const cuisines = household.members.flatMap((m) => m.preferences.cuisines);

  const userMessage = `
Plan a ${occasion.type} occasion for ${occasion.party_size ?? 2} people.
Date: ${occasion.date ?? "this weekend"}
Location: ${occasion.location ?? "Bangalore"}
Budget max: ₹${occasion.budget_max ?? 6000} for the meal
Dietary constraints: ${[...new Set(constraints)].join(", ") || "none"}
Allergies (hard exclude): ${[...new Set(allergies)].join(", ") || "none"}
Preferred cuisines: ${[...new Set(cuisines)].join(", ") || "any"}
Notes: ${occasion.special_notes ?? occasion.description}

Return 3 realistic Bangalore restaurant options as JSON. No markdown fences.`.trim();

  try {
    // Try Anthropic MCP path first (only if Anthropic key present)
    if (process.env.ANTHROPIC_API_KEY && process.env.SWIGGY_AUTH_TOKEN) {
      try {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const mcpConfig = {
          type: "url" as const,
          url: process.env.MCP_FOOD_URL ?? "https://mcp.swiggy.com/food",
          headers: { Authorization: `Bearer ${process.env.SWIGGY_AUTH_TOKEN}` },
        };
        const response = await (client.beta.messages as unknown as {
          create: (p: unknown) => Promise<{ content: Array<{ type: string; text?: string }> }>;
        }).create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
          mcp_servers: [{ name: "swiggy-food", ...mcpConfig }],
          betas: ["mcp-client-2025-04-04"],
        });
        const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]) as FoodAgentResult;
      } catch {
        // fall through to generic LLM
      }
    }

    // Generic LLM path (Gemini or Anthropic without MCP)
    const text = await llmComplete({ system: SYSTEM_PROMPT, messages: [{ role: "user", content: userMessage }] });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in food agent response");
    return JSON.parse(match[0]) as FoodAgentResult;
  } catch (err) {
    console.error("[FoodAgent]", err);
    return {
      restaurants: [],
      recommendation: "",
      cart_ready: false,
      notes: "Food agent unavailable",
      degraded: true,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
