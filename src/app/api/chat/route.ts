import { NextRequest, NextResponse } from "next/server";
import { orchestrate } from "@/lib/agents/orchestrator";
import { getHousehold } from "@/lib/household";
import { getDemoHousehold } from "@/lib/demo-seed";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const { message, household_id } = body as {
    message: string;
    household_id?: string;
    session_id?: string;
  };

  // Load household — fall back to demo if not found
  let household = household_id ? await getHousehold(household_id) : null;
  if (!household) household = await getDemoHousehold();

  // Check if this is a casual greeting, not an occasion request
  const isOccasion =
    /occasion|anniversary|birthday|dinner|lunch|brunch|parents|visit|surprise|plan|book|restaurant|celebrate|friend/i.test(
      message
    );

  if (!isOccasion) {
    return NextResponse.json({
      message:
        "Hi! I'm Plus-One — your Swiggy household orchestrator. Tell me about an occasion you're planning (anniversary, birthday, parents visiting, etc.) and I'll coordinate everything across Food, Instamart, and Dineout for you.",
      quick_replies: [
        "Plan an anniversary dinner",
        "Parents visiting this weekend",
        "Birthday surprise for my partner",
        "Client dinner booking",
      ],
    });
  }

  const result = await orchestrate(message, household);

  return NextResponse.json({
    message: result.message,
    plan: result.plan,
    requires_confirmation: true,
    agent_status: result.agent_status,
    quick_replies: ["Yes, book it!", "Show alternatives", "Change restaurant", "Adjust timing"],
  });
}
