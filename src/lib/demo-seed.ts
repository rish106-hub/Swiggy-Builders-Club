import { createHousehold, getHousehold } from "./household";
import type { HouseholdProfile } from "@/types";

const DEMO_HOUSEHOLD_ID = "hh_demo001";

export const DEMO_HOUSEHOLD: HouseholdProfile = {
  household_id: DEMO_HOUSEHOLD_ID,
  members: [
    {
      id: "member_rishav",
      name: "Rishav",
      role: "primary_orderer",
      dietary_constraints: [],
      allergies: [],
      preferences: {
        cuisines: ["North Indian", "Continental", "Italian"],
        disliked_cuisines: [],
        favorite_items: ["biryani", "pasta", "dal makhani"],
        meal_timing: "evening",
        budget_range: "premium",
      },
      order_history_count: 47,
      last_order_date: new Date().toISOString(),
    },
    {
      id: "member_partner",
      name: "Partner",
      role: "co_consumer",
      dietary_constraints: ["vegetarian"],
      allergies: ["mushrooms"],
      preferences: {
        cuisines: ["North Indian", "Continental"],
        disliked_cuisines: ["Chinese"],
        favorite_items: ["dark chocolate", "paneer butter masala", "red velvet cake"],
        meal_timing: "evening",
        budget_range: "premium",
      },
      order_history_count: 31,
      last_order_date: new Date().toISOString(),
    },
  ],
  budget: {
    daily_food_limit: 1500,
    weekly_limit: 8000,
    special_occasion_limit: 8000,
    per_head_comfortable: 2500,
  },
  cards: [
    {
      card_id: "card_hdfc_cc",
      bank: "HDFC",
      type: "credit",
      active_offers: ["HDFC10", "GIRF"],
      dinecash_balance: 350,
    },
  ],
  occasions: [
    {
      occasion_id: "occ_anniversary_2025",
      type: "anniversary",
      date: "2025-04-20",
      recurrence: "annual",
      importance: "critical",
      members_involved: ["member_rishav", "member_partner"],
      typical_pattern: "Dineout at Olive Beach + dark chocolate cake from Instamart",
    },
  ],
  learned_patterns: [
    {
      pattern_id: "pat_001",
      description: "Partner prefers North Indian over other cuisines for special occasions",
      frequency: "always",
      vertical: "Dineout",
      confidence: 0.92,
      last_observed: new Date().toISOString(),
      evidence_count: 8,
    },
    {
      pattern_id: "pat_002",
      description: "Dark chocolate cake ordered for every anniversary",
      frequency: "always",
      vertical: "Instamart",
      confidence: 0.95,
      last_observed: new Date().toISOString(),
      evidence_count: 3,
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function getDemoHousehold(): Promise<HouseholdProfile> {
  const existing = await getHousehold(DEMO_HOUSEHOLD_ID).catch(() => null);
  if (existing) return existing;
  return seedDemoHousehold();
}

export async function seedDemoHousehold(): Promise<HouseholdProfile> {
  try {
    const household = await createHousehold({
      members: DEMO_HOUSEHOLD.members,
      cards: DEMO_HOUSEHOLD.cards,
    });
    // Override with demo ID
    const { updateHousehold } = await import("./household");
    await updateHousehold(household.household_id, {
      occasions: DEMO_HOUSEHOLD.occasions,
      learned_patterns: DEMO_HOUSEHOLD.learned_patterns,
    });
    return { ...household, household_id: DEMO_HOUSEHOLD_ID };
  } catch {
    return DEMO_HOUSEHOLD;
  }
}
