# Plus-One

## What This Is

Plus-One is a persistent multi-agent AI household orchestrator that coordinates Swiggy Food, Instamart, and Dineout simultaneously to plan and execute high-stakes family occasions — anniversary dinners, parents visiting, client meals — from a single conversation. It builds a household preference model over time (dietary constraints, favourite cuisines, payment cards, occasion patterns) so the agent becomes more valuable with every use. It is the product proof of Swiggy's structural moat: no competitor owns all three verticals under one umbrella.

## Core Value

A household completes a full occasion plan — restaurant booked, gifts timed, offers stacked — without leaving Plus-One.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can start a conversation describing an occasion and receive a cross-vertical plan (restaurant + gifts + offer stack)
- [ ] Orchestrator runs Food, Instamart, and Dineout agents in parallel (Promise.all)
- [ ] Agent loads household context (members, dietary constraints, cards) before every plan
- [ ] Dineout agent stacks offers in correct order: GIRF → card → DineCash
- [ ] Instamart agent times deliveries relative to reservation (flowers before, cake after starters)
- [ ] No booking or order placed without explicit user confirmation
- [ ] MCP failures degrade gracefully: partial plan + deeplink fallback, never full block
- [ ] Cold-start onboarding (3-question wizard) creates household profile
- [ ] Household profile persists across sessions (PostgreSQL + Redis)
- [ ] Cost breakdown shown at every plan: original → after each offer → final savings
- [ ] Timeline diagram generated for every confirmed occasion plan
- [ ] Demo household pre-seeded (Rishav's household, wife preferences, HDFC card)

### Out of Scope

- Twitter/X posting — not relevant to occasion coordination
- Zomato or EazyDiner integration — Swiggy MCP only (thesis is Swiggy One moat)
- Mobile native app — web only, mobile-responsive
- Multi-household / team accounts — single household MVP
- Payment processing — user pays in Swiggy app, not through Plus-One
- WhatsApp/SMS notifications — email only, post-MVP
- Subscription billing — free for Builders Club demo
- Menu calorie tracking — HealthifyMe territory
- Scheduled recurring orders — post-MVP
- Restaurant-side admin dashboard — B2B, post-MVP

## Context

- **Builders Club context:** This is a Swiggy Builders Club demo entry. Three Swiggy MCP servers are the integration surface: `mcp.swiggy.com/food`, `mcp.swiggy.com/im`, `mcp.swiggy.com/dineout`. Auth is Swiggy OAuth via MCP redirect URI.
- **North Star:** Cross-vertical orders per active household per week. MVP target: ≥1 occasion plan executed using ≥2 Swiggy verticals.
- **Demo flow:** "Anniversary Saturday, surprise her" → parallel agent run → merged plan → confirm → Dineout booking + Instamart orders + timeline. Must complete in <15s (P90).
- **Moat:** Household preference model grows with every use. Competitors (Google AI Mode, Zomato MCP, EazyDiner) are stateless or single-vertical.
- **Primary persona:** Rishav/Priya archetype — 26-38, Bangalore/Delhi/Mumbai, Swiggy One user, HDFC credit card, orders 3-5x/week, dines out 2-4x/month. Pain: manages family food preferences mentally, anniversary planning takes 45 min across 3 apps.
- **Known MCP reliability note:** Dineout `book_table` can fail at checkout. Must always return deeplink fallback. Never block plan on reservation failure.

## Constraints

- **Tech Stack**: Next.js 15 + Tailwind CSS (frontend), Node.js + TypeScript + Fastify (backend), Claude Sonnet 4 for all agents — per SPEC §STACK
- **AI**: Anthropic SDK (`@anthropic-ai/sdk`), all 4 agents on Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **MCP Transport**: HTTP (not stdio), Swiggy OAuth token per session
- **Agent Timeout**: 30s per agent, 60s total orchestration budget
- **Performance**: Orchestrator response < 15s P90 (demo requirement)
- **Security**: Never store card numbers, CVV, or OTPs — constraint C-4
- **Data**: household.json updated only from verified MCP order history, never from user claims alone — constraint C-8
- **Offer stacking**: GIRF → card offer → DineCash sequence is non-negotiable — invariant INV-6
- **Confirmation gate**: book_table and all order placements require explicit user "yes/confirm" — invariant INV-2
- **Deployment**: Frontend on Vercel, backend on Railway, PostgreSQL + Upstash Redis

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Claude Sonnet 4 for all agents | Consistent reasoning quality across all 3 verticals; orchestrator needs strong JSON synthesis | — Pending |
| Fastify over Express | Better JSON throughput, TypeScript-native, lighter overhead for agent orchestration API | — Pending |
| Promise.all parallel agent delegation | Invariant INV-1 — sequential would add 60-90s latency, killing demo feel | — Pending |
| PostgreSQL + Redis (not file-only) | household.json fine for dev/demo; production requires durable preference model across sessions | — Pending |
| Drizzle ORM | TypeScript-native, fast query builder, no reflection overhead vs Prisma | — Pending |
| Swiggy-adherent brand kit | Builders Club entry — judges expect Swiggy DNA in the UI | — Pending |
| 3-option max for restaurant alternatives | Soft constraint S-4 — decision paralysis above 3 options; mirrors Swiggy's own UI pattern | — Pending |
| household.json file fallback for dev | Unblock local dev without DB dependency; swap to Postgres for production | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-25 after initialization*
