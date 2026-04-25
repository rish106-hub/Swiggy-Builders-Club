# Plus-One — AI Household Orchestrator for Swiggy

> **Swiggy Builders Club Submission** — Multi-agent AI assistant that plans complete occasions (anniversary dinners, parents' visits, client dinners) by coordinating Swiggy Food, Instamart, and Dineout in parallel.

---

## What It Does

You type: *"Plan our anniversary dinner this Saturday, budget ₹6000"*

Plus-One runs three AI agents simultaneously:

| Agent | What it does |
|-------|-------------|
| **Food Agent** | Finds 3 restaurants matching your cuisine preferences, dietary constraints, and budget via Swiggy Food MCP |
| **Instamart Agent** | Sources cake + flowers with timed deliveries (flowers arrive before you leave, cake arrives after starters) |
| **Dineout Agent** | Checks table availability, stacks GIRF + card + DineCash offers in the correct order, generates deeplink |

The Orchestrator merges all three results into a single occasion plan with a timeline, cost breakdown, and one-tap confirm flow.

---

## Architecture

```
User Message
     │
     ▼
Orchestrator (src/lib/agents/orchestrator.ts)
     │
     ├─── Food Agent ──────► Swiggy Food MCP (or LLM simulation)
     ├─── Instamart Agent ──► Swiggy Instamart MCP (or LLM simulation)
     └─── Dineout Agent ───► Swiggy Dineout MCP (or LLM simulation)
           │
           ▼
     Conflict Resolution → Timeline Build → Plan Assembly
           │
           ▼
     LLM: Generate warm summary message
           │
           ▼
     Chat UI (Next.js App Router)
```

**Key invariants enforced in code:**
- `INV-1`: All 3 agents run via `Promise.all` — never sequential
- `INV-2`: `book_table` / order placement only after explicit user "confirm" (TypeScript literal type gate)
- `INV-3`: Household allergies propagated to every agent call
- `INV-6`: Offer stacking always GIRF → card → DineCash (no deviation)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19) |
| Styling | Tailwind CSS v4 |
| LLM | Gemini 2.5 Flash (primary) / Claude Sonnet 4 (fallback) |
| MCP | Swiggy Food, Instamart, Dineout via HTTP transport |
| Database | PostgreSQL + Drizzle ORM (optional; file fallback) |
| Session | Redis (optional; in-memory fallback) |
| Deploy | Vercel (region: bom1 Mumbai) |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/rish106-hub/Swiggy-Builders-Club.git
cd Swiggy-Builders-Club
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# LLM — set at least ONE. Gemini preferred if both present.
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...

# Optional — uses household.json fallback if not set
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Optional — uses in-memory Map if not set
REDIS_URL=redis://...

# Swiggy MCP (Builders Club program)
MCP_FOOD_URL=https://mcp.swiggy.com/food
MCP_INSTAMART_URL=https://mcp.swiggy.com/im
MCP_DINEOUT_URL=https://mcp.swiggy.com/dineout
SWIGGY_AUTH_TOKEN=your_token_here
```

> **Without `SWIGGY_AUTH_TOKEN`**: All agents fall back to LLM simulation with `degraded: true` — the app is fully functional, showing simulated Bangalore restaurants, offers, and gift suggestions.

### 3. Seed demo household

```bash
curl -X POST http://localhost:3000/api/seed
```

This creates `hh_demo001` — a Bangalore household with:
- Vegetarian wife (no mushrooms, loves dark chocolate, North Indian cuisine)
- HDFC credit card
- DineCash balance ₹350

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Flow

Try these messages in the chat:

```
"Plan our anniversary dinner this Saturday, budget ₹6000"
"My parents are visiting next Sunday, 4 people, North Indian please"
"Client dinner Friday evening, ₹8000 budget"
```

The UI shows:
- **Agent status bar** — real-time Food / Instamart / Dineout progress indicators
- **Plan card** — top restaurant pick with rating, cuisine, ambiance
- **Cost breakdown** — step-down visual: ₹6000 → GIRF → card offer → DineCash → final
- **Timeline** — flowers arrive at 19:45, leave home at 19:00, restaurant at 20:00, cake at 20:15
- **Confirm CTA** — triggers actual booking (INV-2 gate)

---

## Swiggy MCP Integration

### Getting your auth token

The `SWIGGY_AUTH_TOKEN` is provided through the **Swiggy Builders Club** program. To get access:

1. Apply at the Swiggy Builders Club portal
2. Get approved for MCP server access
3. Receive your bearer token for `mcp.swiggy.com`

### MCP servers used

| Server | Endpoint | Key tools |
|--------|----------|-----------|
| `swiggy-food` | `https://mcp.swiggy.com/food` | `search_restaurants`, `get_menu`, `add_to_cart` |
| `swiggy-instamart` | `https://mcp.swiggy.com/im` | `search_products`, `schedule_delivery` |
| `swiggy-dineout` | `https://mcp.swiggy.com/dineout` | `check_availability`, `get_offers`, `book_table` |

All MCP calls go through `src/lib/mcp/client.ts` with `safeMCPCall<T>()` — any failure gracefully degrades to LLM simulation.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # Main chat endpoint — runs orchestration
│   │   ├── confirm/route.ts    # INV-2 confirmation gate → booking
│   │   ├── household/          # CRUD for household profiles
│   │   └── seed/route.ts       # Demo household seeder
│   ├── household/page.tsx      # Household profile viewer
│   └── page.tsx                # Main chat UI
├── components/
│   ├── chat/
│   │   ├── ChatMessage.tsx     # Message bubbles + plan cards + status bar
│   │   ├── ChatInput.tsx       # Auto-growing textarea
│   │   └── TypingIndicator.tsx # Animated dots
│   ├── plan/
│   │   ├── PlanCard.tsx        # Full occasion plan display
│   │   ├── CostBreakdown.tsx   # Offer stacking step-down visual
│   │   └── TimelineView.tsx    # Sorted event timeline
│   └── ui/
│       └── AgentStatus.tsx     # Food/Instamart/Dineout status dots
├── lib/
│   ├── agents/
│   │   ├── orchestrator.ts     # Parallel agent runner + plan assembly
│   │   ├── food-agent.ts       # Restaurant search
│   │   ├── instamart-agent.ts  # Gift/delivery planning
│   │   └── dineout-agent.ts    # Availability + offer stacking
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema
│   │   └── index.ts            # getDb() with null fallback
│   ├── llm.ts                  # Gemini/Anthropic provider abstraction
│   ├── household.ts            # Profile storage (Postgres or JSON file)
│   └── mcp/client.ts           # Safe MCP call wrapper + deeplinks
└── types/index.ts              # All TypeScript interfaces
```

---

## Household Profile

Plus-One learns your household over time:

```json
{
  "household_id": "hh_demo001",
  "members": [
    {
      "name": "Rishav",
      "dietary_constraints": ["vegetarian"],
      "allergies": ["mushrooms"],
      "preferences": {
        "cuisines": ["North Indian", "Italian"],
        "favorite_items": ["dark chocolate cake", "red roses"]
      }
    }
  ],
  "cards": [
    {
      "bank": "HDFC",
      "type": "credit",
      "dinecash_balance": 350
    }
  ]
}
```

Without a database, this is stored at `data/household.json`.

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard or:

```bash
vercel env add GEMINI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add SWIGGY_AUTH_TOKEN
```

The `vercel.json` config targets region `bom1` (Mumbai) for lowest latency to Swiggy's infrastructure.

---

## LLM Provider

The app auto-selects based on available keys:

```
GEMINI_API_KEY set     → Gemini 2.5 Flash (primary)
GEMINI_API_KEY missing → Claude Sonnet 4 (fallback)
Both set               → Gemini 2.5 Flash wins
```

Override in `src/lib/llm.ts` → `activeProvider()`.

---

## Built for Swiggy Builders Club

This project demonstrates native Swiggy MCP integration across all three verticals — Food, Instamart, and Dineout — orchestrated by an AI agent that understands household context, dietary constraints, payment preferences, and occasion semantics.

The architecture is production-ready: graceful MCP degradation, TypeScript-gated booking confirmation, allergy constraint propagation, and offer stacking that follows Swiggy's exact GIRF → card → DineCash sequence.
