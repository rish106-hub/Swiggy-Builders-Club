import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { getDb, schema } from "./db";
import type { HouseholdProfile, HouseholdMember, PaymentCard } from "@/types";

const FALLBACK_PATH = path.join(process.cwd(), "data", "household.json");

async function readFallback(): Promise<Record<string, HouseholdProfile>> {
  try {
    const raw = await fs.readFile(FALLBACK_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeFallback(data: Record<string, HouseholdProfile>) {
  await fs.mkdir(path.dirname(FALLBACK_PATH), { recursive: true });
  await fs.writeFile(FALLBACK_PATH, JSON.stringify(data, null, 2));
}

export async function getHousehold(householdId: string): Promise<HouseholdProfile | null> {
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(schema.households)
      .where(eq(schema.households.household_id, householdId));
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      household_id: r.household_id,
      members: r.members as HouseholdProfile["members"],
      budget: r.budget as HouseholdProfile["budget"],
      cards: r.cards as HouseholdProfile["cards"],
      occasions: r.occasions as HouseholdProfile["occasions"],
      learned_patterns: r.learned_patterns as HouseholdProfile["learned_patterns"],
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    };
  }
  const store = await readFallback();
  return store[householdId] ?? null;
}

export async function createHousehold(data: {
  members: HouseholdMember[];
  cards: PaymentCard[];
}): Promise<HouseholdProfile> {
  const now = new Date().toISOString();
  const profile: HouseholdProfile = {
    household_id: `hh_${uuidv4().slice(0, 8)}`,
    members: data.members,
    budget: {
      daily_food_limit: 2000,
      weekly_limit: 10000,
      special_occasion_limit: 8000,
      per_head_comfortable: 1500,
    },
    cards: data.cards,
    occasions: [],
    learned_patterns: [],
    created_at: now,
    updated_at: now,
  };

  const db = getDb();
  if (db) {
    await db.insert(schema.households).values({
      household_id: profile.household_id,
      members: profile.members,
      budget: profile.budget,
      cards: profile.cards,
      occasions: profile.occasions,
      learned_patterns: profile.learned_patterns,
    });
  } else {
    const store = await readFallback();
    store[profile.household_id] = profile;
    await writeFallback(store);
  }
  return profile;
}

export async function updateHousehold(
  householdId: string,
  updates: Partial<Pick<HouseholdProfile, "members" | "cards" | "occasions" | "learned_patterns" | "budget">>
): Promise<HouseholdProfile | null> {
  const existing = await getHousehold(householdId);
  if (!existing) return null;

  const updated: HouseholdProfile = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const db = getDb();
  if (db) {
    await db
      .update(schema.households)
      .set({
        members: updated.members,
        cards: updated.cards,
        occasions: updated.occasions,
        learned_patterns: updated.learned_patterns,
        budget: updated.budget,
        updated_at: new Date(),
      })
      .where(eq(schema.households.household_id, householdId));
  } else {
    const store = await readFallback();
    store[householdId] = updated;
    await writeFallback(store);
  }
  return updated;
}
