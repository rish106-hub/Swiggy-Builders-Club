import Anthropic from "@anthropic-ai/sdk";
import type { HouseholdProfile, OccasionContext, InstamartAgentResult } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Instamart Agent for Plus-One.

ROLE: Source occasion items (cakes, flowers, gifts). Coordinate delivery timing relative to reservation.

MCP SERVER: swiggy-instamart (https://mcp.swiggy.com/im)

AVAILABLE TOOLS:
- search_products(category, occasion, preference_tags[], budget_max)
- get_product_details(product_id)
- check_delivery_window(product_id, earliest_time, latest_time, address)
- build_cart(items[])

DELIVERY RULES:
- Flowers: arrive BEFORE restaurant seating (15-20 min before reservation)
- Cake: arrive AFTER starters served (15 min after reservation start)
- Default window precision: ±15 min
- If window conflict: prefer cake timing (surprise moment > flowers timing)
- NEVER promise exact delivery time — always show ±15 min window

OUTPUT FORMAT (strict JSON, no markdown):
{
  "items": [{
    "id": string,
    "name": string,
    "price": number,
    "delivery_window": { "earliest": string, "latest": string },
    "match_reason": string,
    "type": "cake" | "flowers" | "gift" | "groceries"
  }],
  "delivery_plan": [{ "item": string, "target_time": string, "window": string }],
  "total_cost": number,
  "notes": string,
  "degraded": boolean
}`;

export async function runInstamartAgent(
  occasion: OccasionContext,
  household: HouseholdProfile,
  reservationTime?: string
): Promise<InstamartAgentResult> {
  const preferences = household.members
    .flatMap((m) => m.preferences.favorite_items)
    .join(", ");
  const resTime = reservationTime ?? "20:00";
  const [resHour, resMin] = resTime.split(":").map(Number);

  const flowersTime = `${String(resHour).padStart(2, "0")}:${String(
    Math.max(0, resMin - 15)
  ).padStart(2, "0")}`;
  const cakeTime = `${String(resHour).padStart(2, "0")}:${String(resMin + 15).padStart(2, "0")}`;

  const userMessage = `
Plan gift/surprise items for a ${occasion.type} occasion.
Reservation time: ${resTime}
Flowers delivery target: ${flowersTime} (±15 min)
Cake delivery target: ${cakeTime} (±15 min)
Household preferences: ${preferences || "dark chocolate cake, red roses"}
Location: ${occasion.location ?? "Bangalore"}
Budget for gifts: ₹${Math.round((occasion.budget_max ?? 6000) * 0.15)} max
Notes: ${occasion.special_notes ?? occasion.description}

Search for a cake and flowers. Schedule deliveries correctly relative to reservation time.
Return as JSON.`.trim();

  try {
    const mcpConfig = {
      type: "url" as const,
      url: process.env.MCP_INSTAMART_URL ?? "https://mcp.swiggy.com/im",
      ...(process.env.SWIGGY_AUTH_TOKEN
        ? { headers: { Authorization: `Bearer ${process.env.SWIGGY_AUTH_TOKEN}` } }
        : {}),
    };

    let responseText = "";
    try {
      const response = await (client.beta.messages as unknown as {
        create: (params: unknown) => Promise<{ content: Array<{ type: string; text?: string }> }>;
      }).create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
        mcp_servers: [{ name: "swiggy-instamart", ...mcpConfig }],
        betas: ["mcp-client-2025-04-04"],
      });
      responseText = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
    } catch {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system:
          SYSTEM_PROMPT +
          "\n\nNOTE: MCP tools unavailable. Return realistic Instamart gift items for an anniversary occasion. Mark degraded:true.",
        messages: [{ role: "user", content: userMessage }],
      });
      responseText = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("");
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in instamart agent response");
    return JSON.parse(jsonMatch[0]) as InstamartAgentResult;
  } catch (err) {
    console.error("[InstamartAgent]", err);
    return {
      items: [],
      delivery_plan: [],
      total_cost: 0,
      notes: "Instamart agent unavailable",
      degraded: true,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
