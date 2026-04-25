import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import type { HouseholdMember, BudgetPreferences, PaymentCard, Occasion, LearnedPattern } from "@/types";

export const households = pgTable("households", {
  household_id: text("household_id").primaryKey(),
  members: jsonb("members").$type<HouseholdMember[]>().notNull().default([]),
  budget: jsonb("budget").$type<BudgetPreferences>().notNull(),
  cards: jsonb("cards").$type<PaymentCard[]>().notNull().default([]),
  occasions: jsonb("occasions").$type<Occasion[]>().notNull().default([]),
  learned_patterns: jsonb("learned_patterns").$type<LearnedPattern[]>().notNull().default([]),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const occasion_plans = pgTable("occasion_plans", {
  plan_id: text("plan_id").primaryKey(),
  household_id: text("household_id").notNull(),
  occasion: jsonb("occasion").notNull(),
  restaurant: jsonb("restaurant"),
  alternatives: jsonb("alternatives").$type<unknown[]>().default([]),
  gifts: jsonb("gifts").$type<unknown[]>().default([]),
  cost_breakdown: jsonb("cost_breakdown"),
  timeline: jsonb("timeline").$type<unknown[]>().default([]),
  total_cost: text("total_cost"),
  total_savings: text("total_savings"),
  status: text("status").notNull().default("planned"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
