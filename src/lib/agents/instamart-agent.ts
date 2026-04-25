import { llmComplete } from "@/lib/llm";
import type { HouseholdProfile, OccasionContext, InstamartAgentResult } from "@/types";

const SYSTEM_PROMPT = `You are the Instamart Agent for Plus-One.

ROLE: Source occasion items (cakes, flowers, gifts). Schedule deliveries relative to reservation.

DELIVERY RULES:
- Flowers: arrive BEFORE restaurant seating (15-20 min before reservation)
- Cake: arrive AFTER starters served (15 min after reservation start)
- NEVER promise exact time — always show ±15 min window

When MCP tools are unavailable, simulate realistic Instamart items.

OUTPUT FORMAT (strict JSON only, no markdown fences):
{
  "items": [{
    "id": string,
    "name": string,
    "price": number,
    "delivery_window": { "earliest": string, "latest": string },
    "match_reason": string,
    "type": "cake" | "flowers" | "gift"
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
  const preferences = household.members.flatMap((m) => m.preferences.favorite_items).join(", ");
  const resTime = reservationTime ?? "20:00";
  const [resHour, resMin] = resTime.split(":").map(Number);

  const flowersHour = resHour;
  const flowersMin = Math.max(0, resMin - 15);
  const cakeMin = resMin + 15;
  const cakeHour = cakeMin >= 60 ? resHour + 1 : resHour;

  const userMessage = `
Plan gift/surprise items for a ${occasion.type} occasion.
Reservation time: ${resTime}
Flowers delivery target: ${String(flowersHour).padStart(2,"0")}:${String(flowersMin).padStart(2,"0")} (±15 min, arrive BEFORE reservation)
Cake delivery target: ${String(cakeHour).padStart(2,"0")}:${String(cakeMin % 60).padStart(2,"0")} (±15 min, arrive AFTER starters)
Household preferences: ${preferences || "dark chocolate cake, red roses"}
Location: ${occasion.location ?? "Bangalore"}
Budget for gifts: ₹${Math.round((occasion.budget_max ?? 6000) * 0.15)} max
Notes: ${occasion.special_notes ?? occasion.description}

Return 1 cake + 1 flowers item with correct delivery timing. No markdown fences.`.trim();

  try {
    const text = await llmComplete({ system: SYSTEM_PROMPT, messages: [{ role: "user", content: userMessage }] });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in instamart agent response");
    return JSON.parse(match[0]) as InstamartAgentResult;
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
