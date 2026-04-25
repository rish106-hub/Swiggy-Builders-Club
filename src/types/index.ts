export type DietaryConstraint =
  | "vegetarian"
  | "vegan"
  | "jain"
  | "halal"
  | "diabetic_friendly"
  | "gluten_free"
  | "lactose_intolerant"
  | "no_pork"
  | "no_beef";

export interface HouseholdMember {
  id: string;
  name: string;
  role: "primary_orderer" | "co_consumer" | "child" | "guest";
  age_range?: string;
  dietary_constraints: DietaryConstraint[];
  allergies: string[];
  preferences: {
    cuisines: string[];
    disliked_cuisines: string[];
    favorite_items: string[];
    meal_timing: string;
    budget_range: "budget" | "mid" | "premium" | "fine_dining";
    fitness_goal?: "cutting" | "bulking" | "maintenance";
  };
  order_history_count: number;
  last_order_date: string;
}

export interface BudgetPreferences {
  daily_food_limit: number;
  weekly_limit: number;
  special_occasion_limit: number;
  per_head_comfortable: number;
}

export interface PaymentCard {
  card_id: string;
  bank: "HDFC" | "SBI" | "Axis" | "ICICI" | "Kotak" | "AmEx" | "Other";
  type: "credit" | "debit";
  active_offers: string[];
  dinecash_balance?: number;
}

export interface Occasion {
  occasion_id: string;
  type: "anniversary" | "birthday" | "parents_visit" | "client_dinner" | "friends" | "custom";
  date: string;
  recurrence?: "annual" | "monthly" | "one_time";
  importance: "low" | "medium" | "high" | "critical";
  members_involved: string[];
  typical_pattern?: string;
  notes?: string;
}

export interface LearnedPattern {
  pattern_id: string;
  description: string;
  frequency: "always" | "usually" | "sometimes" | "rarely";
  vertical: "Food" | "Instamart" | "Dineout" | "Cross";
  confidence: number;
  last_observed: string;
  evidence_count: number;
}

export interface HouseholdProfile {
  household_id: string;
  created_at: string;
  updated_at: string;
  members: HouseholdMember[];
  budget: BudgetPreferences;
  cards: PaymentCard[];
  occasions: Occasion[];
  learned_patterns: LearnedPattern[];
}

export interface TimelineEvent {
  time: string;
  label: string;
  type: "depart" | "arrive" | "delivery" | "milestone" | "transport";
  status: "pending" | "confirmed" | "failed";
  notes?: string;
}

export interface CostBreakdown {
  original: number;
  after_girf: number;
  after_card: number;
  after_dinecash: number;
  net_savings: number;
  final: number;
  girf_percent?: number;
  card_bank?: string;
  card_percent?: number;
  dinecash_used?: number;
}

export interface RestaurantOption {
  id: string;
  name: string;
  rating: number;
  cuisine: string;
  ambiance: string;
  estimated_bill: number;
  match_score: number;
  reasoning: string;
  availability?: Record<string, boolean>;
  net_cost?: number;
  cost_breakdown?: CostBreakdown;
}

export interface GiftPlan {
  id: string;
  name: string;
  price: number;
  delivery_window: { earliest: string; latest: string };
  match_reason: string;
  type: "cake" | "flowers" | "gift" | "groceries";
}

export interface OccasionPlan {
  plan_id: string;
  household_id: string;
  occasion: {
    type: string;
    date: string;
    description: string;
  };
  restaurant: RestaurantOption;
  alternatives: RestaurantOption[];
  gifts: GiftPlan[];
  offers: {
    girf?: { percent: number; savings: number };
    card?: { bank: string; percent: number; savings: number };
    dinecash?: { usable: number };
  };
  cost_breakdown: CostBreakdown;
  timeline: TimelineEvent[];
  total_cost: number;
  total_savings: number;
  message: string;
  requires_confirmation: boolean;
  status: "planned" | "confirmed" | "executing" | "completed" | "partial" | "failed";
  created_at: string;
}

export interface AgentStatus {
  status: "idle" | "running" | "done" | "error";
  message?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  plan?: OccasionPlan;
  quick_replies?: string[];
  agent_status?: {
    food: AgentStatus;
    instamart: AgentStatus;
    dineout: AgentStatus;
  };
  timestamp: string;
}

export interface OccasionContext {
  type: string;
  date?: string;
  party_size?: number;
  budget_max?: number;
  location?: string;
  special_notes?: string;
  description: string;
}

// Agent result types
export interface FoodAgentResult {
  restaurants: RestaurantOption[];
  recommendation: string;
  cart_ready: boolean;
  notes: string;
  degraded?: boolean;
  error?: string;
}

export interface InstamartAgentResult {
  items: GiftPlan[];
  delivery_plan: Array<{ item: string; target_time: string; window: string }>;
  total_cost: number;
  notes: string;
  degraded?: boolean;
  error?: string;
}

export interface DineoutAgentResult {
  availability: Record<string, boolean>;
  offers: {
    girf?: { percent: number; savings: number };
    card?: { bank: string; percent: number; savings: number };
    dinecash?: { usable: number };
    restaurant_specific?: { description: string; savings: number };
  };
  cost_breakdown: CostBreakdown;
  redemption_sequence: string[];
  booking_status: "ready" | "failed" | "pending_confirmation";
  deeplink?: string;
  degraded?: boolean;
  error?: string;
}

export interface AgentSessionState {
  session_id: string;
  household_id: string;
  occasion_context: OccasionContext;
  agent_states: {
    food: "idle" | "running" | "done" | "error";
    instamart: "idle" | "running" | "done" | "error";
    dineout: "idle" | "running" | "done" | "error";
  };
  food_result?: FoodAgentResult;
  instamart_result?: InstamartAgentResult;
  dineout_result?: DineoutAgentResult;
  merged_plan?: OccasionPlan;
  awaiting_confirmation: boolean;
}
