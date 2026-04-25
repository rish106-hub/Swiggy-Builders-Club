import { NextRequest, NextResponse } from "next/server";
import { createHousehold, getHousehold } from "@/lib/household";
import type { HouseholdMember, PaymentCard } from "@/types";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const household = await getHousehold(id);
  if (!household) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(household);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const members: HouseholdMember[] = (body.members ?? []).map(
    (m: Partial<HouseholdMember>, i: number) => ({
      id: `member_${i + 1}`,
      name: m.name ?? "Member",
      role: m.role ?? "co_consumer",
      dietary_constraints: m.dietary_constraints ?? [],
      allergies: m.allergies ?? [],
      preferences: m.preferences ?? {
        cuisines: [],
        disliked_cuisines: [],
        favorite_items: [],
        meal_timing: "evening",
        budget_range: "mid",
      },
      order_history_count: 0,
      last_order_date: new Date().toISOString(),
    })
  );

  const cards: PaymentCard[] = (body.cards ?? []).map(
    (c: Partial<PaymentCard>, i: number) => ({
      card_id: `card_${i + 1}`,
      bank: c.bank ?? "HDFC",
      type: c.type ?? "credit",
      active_offers: c.active_offers ?? [],
      dinecash_balance: c.dinecash_balance ?? 0,
    })
  );

  const household = await createHousehold({ members, cards });
  return NextResponse.json(household, { status: 201 });
}
