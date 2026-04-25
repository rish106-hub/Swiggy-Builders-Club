import { llmComplete } from "@/lib/llm";
import type { HouseholdProfile, OccasionContext, DineoutAgentResult } from "@/types";
import { DEEPLINKS } from "@/lib/mcp/client";

const SYSTEM_PROMPT = `You are the Dineout Agent for Plus-One.

ROLE: Check table availability. Stack offers optimally. Book tables ONLY after explicit user confirmation.

MCP SERVER: swiggy-dineout (https://mcp.swiggy.com/dineout)

AVAILABLE TOOLS:
- search_restaurants_dineout(location, cuisine, ambiance, party_size)
- check_availability(restaurant_id, date, time, party_size)
- get_offers(restaurant_id)
- calculate_effective_price(restaurant_id, bill_amount, offers[], dinecash_balance)
- book_table(restaurant_id, date, time, party_size) ← ONLY after explicit confirmation

OFFER STACKING RULES (apply in this EXACT order, no deviation):
1. GIRF discount (highest %, applied first on original)
2. HDFC/SBI/Axis card offer (applied on post-GIRF amount)
3. DineCash (flat amount ≤ ₹200, applied last)
4. Restaurant-specific offer (if combinable, after DineCash)

RELIABILITY: If book_table fails, return deeplink. NEVER block plan on booking failure.

OUTPUT FORMAT (strict JSON, no markdown):
{
  "availability": { "20:00": true, "20:30": true, "19:30": false },
  "offers": {
    "girf": { "percent": number, "savings": number },
    "card": { "bank": string, "percent": number, "savings": number },
    "dinecash": { "usable": number }
  },
  "cost_breakdown": {
    "original": number,
    "after_girf": number,
    "after_card": number,
    "after_dinecash": number,
    "net_savings": number,
    "final": number,
    "girf_percent": number,
    "card_bank": string,
    "card_percent": number,
    "dinecash_used": number
  },
  "redemption_sequence": ["GIRF", "HDFC", "DINECASH"],
  "booking_status": "ready",
  "deeplink": string,
  "degraded": boolean
}`;

export async function runDineoutAgent(
  occasion: OccasionContext,
  household: HouseholdProfile,
  restaurantId?: string
): Promise<DineoutAgentResult> {
  const primaryCard = household.cards[0];
  const dinecash = household.cards.reduce(
    (acc, c) => acc + (c.dinecash_balance ?? 0),
    0
  );
  const estimatedBill = occasion.budget_max ?? 5500;

  const userMessage = `
Check Dineout for a ${occasion.type} occasion.
Restaurant ID (if known): ${restaurantId ?? "find best match"}
Date: ${occasion.date ?? "this Saturday"}
Time: 20:00
Party size: ${occasion.party_size ?? 2}
Location: ${occasion.location ?? "Bangalore"}
Card available: ${primaryCard ? `${primaryCard.bank} ${primaryCard.type}` : "none"}
DineCash balance: ₹${dinecash}
Estimated bill: ₹${estimatedBill}

Check availability, get offers, calculate effective price with full offer stack (GIRF → card → DineCash).
Return availability map, full cost breakdown, and deeplink. Do NOT call book_table.`.trim();

  const restaurantDeeplink = DEEPLINKS.dineout(
    restaurantId ?? "restaurant",
    occasion.date ?? "2026-04-26",
    "20:00",
    occasion.party_size ?? 2
  );

  try {
    const systemWithHint =
      SYSTEM_PROMPT +
      `\n\nNOTE: MCP tools unavailable. Simulate realistic Dineout offer stacking for a ₹${estimatedBill} bill. Apply GIRF 25%, ${primaryCard?.bank ?? "HDFC"} 10%, DineCash ₹${Math.min(dinecash, 200)}. Mark degraded:true. Return JSON only, no markdown fences.`;

    const responseText = await llmComplete({
      system: systemWithHint,
      messages: [{ role: "user", content: userMessage }],
    });

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in dineout agent response");
    const result = JSON.parse(jsonMatch[0]) as DineoutAgentResult;
    result.deeplink = result.deeplink || restaurantDeeplink;
    return result;
  } catch (err) {
    console.error("[DineoutAgent]", err);

    // Graceful fallback: compute offer stack manually
    const grifPct = 25;
    const cardPct = primaryCard?.bank === "HDFC" || primaryCard?.bank === "Axis" ? 10 : 0;
    const afterGirf = Math.round(estimatedBill * (1 - grifPct / 100));
    const afterCard = Math.round(afterGirf * (1 - cardPct / 100));
    const dinecashUsed = Math.min(dinecash, 200);
    const final = Math.max(0, afterCard - dinecashUsed);

    return {
      availability: { "19:30": true, "20:00": true, "20:30": true },
      offers: {
        girf: { percent: grifPct, savings: estimatedBill - afterGirf },
        card: { bank: primaryCard?.bank ?? "HDFC", percent: cardPct, savings: afterGirf - afterCard },
        dinecash: { usable: dinecashUsed },
      },
      cost_breakdown: {
        original: estimatedBill,
        after_girf: afterGirf,
        after_card: afterCard,
        after_dinecash: final,
        net_savings: estimatedBill - final,
        final,
        girf_percent: grifPct,
        card_bank: primaryCard?.bank ?? "HDFC",
        card_percent: cardPct,
        dinecash_used: dinecashUsed,
      },
      redemption_sequence: ["GIRF", primaryCard?.bank ?? "HDFC", "DINECASH"],
      booking_status: "ready",
      deeplink: restaurantDeeplink,
      degraded: true,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Gated book_table — only callable with explicit confirmation
export async function bookTable(params: {
  restaurantId: string;
  date: string;
  time: string;
  partySize: number;
  authToken?: string;
  confirmed: true; // type-level confirmation gate
}): Promise<{ confirmation_code: string } | { error: string; deeplink: string }> {
  try {
    const res = await fetch(
      `${process.env.MCP_DINEOUT_URL ?? "https://mcp.swiggy.com/dineout"}/tools/book_table`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(params.authToken
            ? { Authorization: `Bearer ${params.authToken}` }
            : {}),
        },
        body: JSON.stringify({
          params: {
            restaurant_id: params.restaurantId,
            date: params.date,
            time: params.time,
            party_size: params.partySize,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      }
    );
    if (!res.ok) throw new Error(`book_table failed: ${res.status}`);
    return res.json();
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Booking failed",
      deeplink: DEEPLINKS.dineout(params.restaurantId, params.date, params.time, params.partySize),
    };
  }
}
