import Anthropic from "@anthropic-ai/sdk";
import type { HouseholdProfile, OccasionContext, FoodAgentResult } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Food Agent for Plus-One.

ROLE: Find restaurants matching occasion + household preferences. Build order cart if needed.

MCP SERVER: swiggy-food (https://mcp.swiggy.com/food)

AVAILABLE TOOLS:
- search_restaurants(cuisine, location, ambiance, capacity, budget_max, exclude_ingredients)
- get_restaurant_details(restaurant_id)
- get_menu(restaurant_id, exclude_ingredients[])
- build_cart(restaurant_id, items[])
- get_estimated_delivery_time(restaurant_id, address)

ALWAYS:
- Pass exclude_ingredients derived from all household member allergies
- Return match_score (0-1) and reasoning per restaurant
- Return exactly 3 restaurant options ranked by match_score
- If MCP is unavailable, return degraded:true with empty restaurants array

OUTPUT FORMAT (strict JSON, no markdown):
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
  "cart_ready": boolean,
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

Search for restaurants using the search_restaurants tool. Return 3 options as JSON.`.trim();

  try {
    const mcpConfig = {
      type: "url" as const,
      url: process.env.MCP_FOOD_URL ?? "https://mcp.swiggy.com/food",
      ...(process.env.SWIGGY_AUTH_TOKEN
        ? { headers: { Authorization: `Bearer ${process.env.SWIGGY_AUTH_TOKEN}` } }
        : {}),
    };

    // Try with MCP tools first; gracefully fall back to pure LLM if MCP unavailable
    let responseText = "";
    try {
      const response = await (client.beta.messages as unknown as {
        create: (params: unknown) => Promise<{ content: Array<{ type: string; text?: string }> }>;
      }).create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
        mcp_servers: [{ name: "swiggy-food", ...mcpConfig }],
        betas: ["mcp-client-2025-04-04"],
      });
      responseText = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
    } catch {
      // MCP unavailable — fall back to no-tool call
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system:
          SYSTEM_PROMPT +
          "\n\nNOTE: MCP tools are unavailable. Simulate realistic restaurant options for the given location and cuisine preferences. Mark degraded:true.",
        messages: [{ role: "user", content: userMessage }],
      });
      responseText = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("");
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in food agent response");
    return JSON.parse(jsonMatch[0]) as FoodAgentResult;
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
