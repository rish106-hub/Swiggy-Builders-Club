import { NextRequest, NextResponse } from "next/server";
import { bookTable } from "@/lib/agents/dineout-agent";
import { getHousehold, updateHousehold } from "@/lib/household";
import { getDemoHousehold } from "@/lib/demo-seed";
import type { OccasionPlan } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { confirmed, plan, household_id } = body as {
    confirmed: boolean;
    plan: OccasionPlan;
    household_id?: string;
    session_id?: string;
  };

  if (!confirmed) {
    return NextResponse.json({ status: "cancelled", message: "Plan cancelled." });
  }

  if (!plan) {
    return NextResponse.json({ error: "plan required" }, { status: 400 });
  }

  // INV-2: Execution only happens after confirmed === true
  const results: {
    restaurant_booking?: { confirmation_code: string } | { deeplink: string; error: string };
    instamart_orders?: { order_id: string; tracking_url: string }[];
    partial_failures: string[];
  } = { partial_failures: [] };

  // Book table
  if (plan.restaurant?.id && plan.restaurant.id !== "fallback") {
    const booking = await bookTable({
      restaurantId: plan.restaurant.id,
      date: plan.occasion.date,
      time: "20:00",
      partySize: 2,
      confirmed: true,
    });
    results.restaurant_booking = booking;
    if ("error" in booking) {
      results.partial_failures.push("restaurant_booking");
    }
  } else {
    results.restaurant_booking = {
      deeplink: plan.restaurant?.cost_breakdown
        ? `swiggy://dineout/book?rid=${plan.restaurant.id}&date=${plan.occasion.date}&time=20:00&party=2`
        : "swiggy://dineout",
      error: "Direct booking via agent unavailable — complete in Dineout app",
    };
    results.partial_failures.push("restaurant_booking");
  }

  // Instamart orders (simulated — real MCP would place orders)
  if (plan.gifts && plan.gifts.length > 0) {
    results.instamart_orders = plan.gifts.map((g, i) => ({
      order_id: `IM${Date.now()}${i}`,
      tracking_url: `swiggy://instamart/track/${Date.now()}${i}`,
    }));
  }

  // Update household with occasion pattern (INV-4)
  const householdId = household_id ?? plan.household_id;
  if (householdId) {
    const household = await getHousehold(householdId).catch(() => null) ?? await getDemoHousehold();
    if (household) {
      await updateHousehold(householdId, {
        occasions: [
          ...household.occasions,
          {
            occasion_id: plan.plan_id,
            type: plan.occasion.type as "anniversary",
            date: plan.occasion.date,
            recurrence: plan.occasion.type === "anniversary" ? "annual" : "one_time",
            importance: "high",
            members_involved: household.members.map((m) => m.id),
          },
        ],
      }).catch(console.error);
    }
  }

  const status =
    results.partial_failures.length === 0
      ? "completed"
      : results.partial_failures.length < 2
      ? "partial_failure"
      : "failed";

  return NextResponse.json({
    status,
    ...results,
    message:
      status === "completed"
        ? "Everything is booked! Have a wonderful evening."
        : "Plan confirmed with some items needing manual action. Check the deeplinks below.",
  });
}
