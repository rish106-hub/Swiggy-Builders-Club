import { NextResponse } from "next/server";
import { seedDemoHousehold } from "@/lib/demo-seed";

export async function POST() {
  const household = await seedDemoHousehold();
  return NextResponse.json({ success: true, household_id: household.household_id });
}
