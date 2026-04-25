import { llmComplete } from "@/lib/llm";
import { v4 as uuidv4 } from "uuid";
import { runFoodAgent } from "./food-agent";
import { runInstamartAgent } from "./instamart-agent";
import { runDineoutAgent } from "./dineout-agent";
import type {
  HouseholdProfile,
  OccasionContext,
  OccasionPlan,
  TimelineEvent,
  FoodAgentResult,
  InstamartAgentResult,
  DineoutAgentResult,
  AgentStatus,
} from "@/types";


export interface OrchestrationResult {
  plan: OccasionPlan;
  message: string;
  agent_status: {
    food: AgentStatus;
    instamart: AgentStatus;
    dineout: AgentStatus;
  };
}

function parseOccasionContext(message: string): OccasionContext {
  const lower = message.toLowerCase();
  let type = "custom";
  if (lower.includes("anniversary")) type = "anniversary";
  else if (lower.includes("birthday")) type = "birthday";
  else if (lower.includes("parents")) type = "parents_visit";
  else if (lower.includes("client") || lower.includes("business")) type = "client_dinner";
  else if (lower.includes("friends")) type = "friends";

  const dateMatch =
    message.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i) ||
    message.match(/\b(\d{1,2}[\/\-]\d{1,2})\b/);

  const budgetMatch = message.match(/₹\s*(\d+(?:,\d+)?)/);
  const budget = budgetMatch
    ? parseInt(budgetMatch[1].replace(",", ""))
    : undefined;

  return {
    type,
    date: dateMatch ? dateMatch[0] : undefined,
    party_size: message.match(/\b(\d+)\s+people\b/i)
      ? parseInt(message.match(/\b(\d+)\s+people\b/i)![1])
      : 2,
    budget_max: budget,
    location: "Bangalore",
    description: message,
  };
}

function buildTimeline(
  restaurantTime: string,
  giftDeliveries: InstamartAgentResult["delivery_plan"]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const [resHour, resMin] = restaurantTime.split(":").map(Number);

  // Depart 1 hour before
  const departHour = resHour - 1;
  events.push({
    time: `${String(departHour).padStart(2, "0")}:${String(resMin).padStart(2, "0")}`,
    label: "Leave home",
    type: "depart",
    status: "pending",
  });

  // Gift deliveries
  for (const d of giftDeliveries) {
    events.push({
      time: d.target_time,
      label: `${d.item} arrives (${d.window})`,
      type: "delivery",
      status: "pending",
      notes: d.window,
    });
  }

  // Arrive at restaurant
  events.push({
    time: restaurantTime,
    label: "Arrive at restaurant",
    type: "arrive",
    status: "pending",
  });

  // End of evening
  const endHour = resHour + 2;
  events.push({
    time: `${String(endHour).padStart(2, "0")}:00`,
    label: "Evening ends",
    type: "milestone",
    status: "pending",
  });

  return events.sort((a, b) => a.time.localeCompare(b.time));
}

function resolveConflicts(
  foodResult: FoodAgentResult,
  instamartResult: InstamartAgentResult,
  dineoutResult: DineoutAgentResult,
  occasion: OccasionContext
): { foodResult: FoodAgentResult; instamartResult: InstamartAgentResult } {
  // CONF-02: If no food restaurants found, keep as-is (Food Agent handles re-search internally)
  // CONF-01: Timing conflicts — adjust Instamart ±15 min (already handled in instamart-agent)
  // CONF-03: Budget conflict — already handled by agents individually
  return { foodResult, instamartResult };
}

async function generatePlanMessage(
  plan: OccasionPlan,
  occasion: OccasionContext
): Promise<string> {
  const restaurant = plan.restaurant;
  const breakdown = plan.cost_breakdown;
  const topGift = plan.gifts[0];
  const topFlowers = plan.gifts[1];

  const prompt = `You are Plus-One, a household commerce assistant for Swiggy.

Generate a warm, concise occasion plan summary (under 150 words) for:
- Occasion: ${occasion.type}
- Restaurant: ${restaurant.name} (${restaurant.cuisine}, ${restaurant.ambiance})
- Rating: ${restaurant.rating}
- Original bill: ₹${breakdown.original}
- Final after offers: ₹${breakdown.final} (save ₹${breakdown.net_savings})
- Gifts: ${topGift?.name ?? "none"}, ${topFlowers?.name ?? "none"}
- Timeline events: ${plan.timeline.length} events

End with: "Want me to book this? Or see 2 alternatives?"
Be conversational, not robotic. Use ₹ for rupees. Mention specific savings.`;

  return llmComplete({
    system: "You are Plus-One, a household commerce assistant for Swiggy. Be warm, concise, conversational.",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 300,
  });
}

export async function orchestrate(
  userMessage: string,
  household: HouseholdProfile
): Promise<OrchestrationResult> {
  const occasion = parseOccasionContext(userMessage);
  const reservationTime = "20:00";

  const agentStatus: OrchestrationResult["agent_status"] = {
    food: { status: "running" },
    instamart: { status: "running" },
    dineout: { status: "running" },
  };

  // INV-1: Run all 3 agents in parallel
  const [foodResult, instamartResult, dineoutResult] = await Promise.all([
    runFoodAgent(occasion, household).then((r) => {
      agentStatus.food = { status: r.degraded ? "error" : "done", message: r.error };
      return r;
    }),
    runInstamartAgent(occasion, household, reservationTime).then((r) => {
      agentStatus.instamart = { status: r.degraded ? "error" : "done", message: r.error };
      return r;
    }),
    runDineoutAgent(occasion, household).then((r) => {
      agentStatus.dineout = { status: r.degraded ? "error" : "done", message: r.error };
      return r;
    }),
  ]);

  // Resolve conflicts
  const resolved = resolveConflicts(foodResult, instamartResult, dineoutResult, occasion);

  // Merge results
  const topRestaurant = resolved.foodResult.restaurants[0] ?? {
    id: "fallback",
    name: "Swiggy Top Pick",
    rating: 4.3,
    cuisine: "Multi-cuisine",
    ambiance: "Fine dining",
    estimated_bill: occasion.budget_max ?? 5500,
    match_score: 0.8,
    reasoning: "Best match for your occasion",
  };

  // Attach dineout cost breakdown to top restaurant
  topRestaurant.net_cost = dineoutResult.cost_breakdown.final;
  topRestaurant.cost_breakdown = dineoutResult.cost_breakdown;

  const timeline = buildTimeline(reservationTime, resolved.instamartResult.delivery_plan);

  const plan: OccasionPlan = {
    plan_id: uuidv4(),
    household_id: household.household_id,
    occasion: {
      type: occasion.type,
      date: occasion.date ?? "this weekend",
      description: occasion.description,
    },
    restaurant: topRestaurant,
    alternatives: resolved.foodResult.restaurants.slice(1),
    gifts: resolved.instamartResult.items,
    offers: dineoutResult.offers,
    cost_breakdown: dineoutResult.cost_breakdown,
    timeline,
    total_cost:
      dineoutResult.cost_breakdown.final + resolved.instamartResult.total_cost,
    total_savings: dineoutResult.cost_breakdown.net_savings,
    message: "",
    requires_confirmation: true,
    status: "planned",
    created_at: new Date().toISOString(),
  };

  // Generate natural language message
  const message = await generatePlanMessage(plan, occasion);
  plan.message = message;

  return { plan, message, agent_status: agentStatus };
}
