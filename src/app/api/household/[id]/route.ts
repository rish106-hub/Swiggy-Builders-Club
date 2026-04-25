import { NextRequest, NextResponse } from "next/server";
import { getHousehold, updateHousehold } from "@/lib/household";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const household = await getHousehold(id);
  if (!household) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(household);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const updated = await updateHousehold(id, body);
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}
