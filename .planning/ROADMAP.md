# Roadmap: Plus-One

## Overview

Plus-One is built in 7 phases that follow the Swiggy Builders Club milestone order: environment and household foundation first, then each agent vertical independently, then the parallel orchestrator that wires them together, then the Swiggy-branded frontend, and finally demo polish and deployment. Each phase delivers a complete, verifiable capability that unblocks the next. Phase 1 establishes the household data layer that every agent reads. Phases 2–4 each deliver a fully-functional single-vertical agent. Phase 5 wires them into a single parallel-execution orchestrator. Phase 6 wraps everything in a chat UI with plan cards, timeline diagrams, and a confirmation modal. Phase 7 seeds demo data, validates the 15-second P90 target, and ships to Vercel + Railway.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Project scaffolding, database schema, household profile CRUD, and 3-question onboarding
- [ ] **Phase 2: Food Agent** - MCP-connected Food Agent that searches restaurants and returns structured JSON
- [ ] **Phase 3: Instamart Agent** - MCP-connected Instamart Agent with delivery timing logic and conflict window handling
- [ ] **Phase 4: Dineout Agent** - MCP-connected Dineout Agent with GIRF→card→DineCash offer stacking and book_table confirmation gate
- [ ] **Phase 5: Orchestrator** - Parallel Promise.all coordination, result merger, conflict resolver, and timeline builder
- [ ] **Phase 6: Frontend** - Chat UI, agent status indicators, plan card, timeline diagram, cost breakdown, confirmation modal, household page, history page, onboarding wizard
- [ ] **Phase 7: Demo & Polish** - Pre-seeded demo household, error/loading/empty states, P90 < 15s validation, Vercel + Railway deploy

## Phase Details

### Phase 1: Foundation
**Goal**: The project is runnable locally, the household data model exists in PostgreSQL, and a new user can complete a 3-question onboarding wizard that creates a persisted household profile
**Depends on**: Nothing (first phase)
**Requirements**: HH-01, HH-02, HH-03, HH-04, HH-05, HH-06
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` starts both the Next.js frontend and Fastify backend without errors
  2. A new user can complete the 3-question onboarding wizard and the household (members, dietary constraints, cards) is saved to PostgreSQL
  3. After page refresh, the household profile is loaded from the database — data persists across sessions
  4. A household.json fallback is available for local dev without a DB connection
  5. Every agent invocation receives the household context object before planning begins
**Plans**: TBD

### Phase 2: Food Agent
**Goal**: The Food Agent connects to the Swiggy Food MCP server and returns structured restaurant search results that match occasion, dietary constraints, cuisine, ambiance, and budget
**Depends on**: Phase 1
**Requirements**: FOOD-01, FOOD-02, FOOD-03
**Success Criteria** (what must be TRUE):
  1. Calling the Food Agent with an occasion description returns a JSON array of restaurants each with match_score and reasoning
  2. Results respect household dietary exclusions (vegetarian/Jain/gluten-free filters applied)
  3. When the MCP server times out, the agent returns a partial result with a degraded: true flag rather than throwing an error
**Plans**: TBD

### Phase 3: Instamart Agent
**Goal**: The Instamart Agent connects to the Swiggy Instamart MCP server, finds occasion items (cakes, flowers, gifts), and schedules deliveries correctly relative to the reservation time with a ±15 min window
**Depends on**: Phase 2
**Requirements**: IM-01, IM-02, IM-03, IM-04
**Success Criteria** (what must be TRUE):
  1. Calling the Instamart Agent with an occasion and reservation time returns a delivery plan with target times for each item
  2. Flowers are scheduled 15–20 min before the reservation; cake is scheduled 15 min after reservation start
  3. Delivery plan uses ±15 min window notation and never promises an exact time
  4. When the MCP server times out, the agent returns a partial result with a deeplink fallback rather than blocking
**Plans**: TBD

### Phase 4: Dineout Agent
**Goal**: The Dineout Agent connects to the Swiggy Dineout MCP server, checks table availability, stacks offers in GIRF→card→DineCash order, calculates the net effective price, and books only after explicit user confirmation
**Depends on**: Phase 3
**Requirements**: DO-01, DO-02, DO-03, DO-04, DO-05
**Success Criteria** (what must be TRUE):
  1. The Dineout Agent returns table availability for a given restaurant, date, time, and party size
  2. Offers are stacked in exactly GIRF→card offer→DineCash sequence; applying them out of order is impossible
  3. The net effective price after full offer stack is calculated and returned in the agent response
  4. A booking is never placed unless the user has sent "yes" or "confirm" — calling book_table before confirmation throws a guard error
  5. If book_table fails, the agent returns a Dineout deeplink so the user can complete booking in-app; the plan is not blocked
**Plans**: TBD

### Phase 5: Orchestrator
**Goal**: The orchestrator runs all three agents simultaneously using Promise.all, merges their results into a single coherent plan, resolves timing and availability conflicts, and builds a sorted timeline of all events
**Depends on**: Phase 4
**Requirements**: OCC-01, OCC-02, OCC-03, OCC-04, OCC-05, OCC-06, OCC-07, OCC-08, CONF-01, CONF-02, CONF-03, EXEC-01, EXEC-02, EXEC-03, EXEC-04
**Success Criteria** (what must be TRUE):
  1. Sending a natural-language occasion description returns a merged plan from all three agents; Food, Instamart, and Dineout logs show concurrent execution (Promise.all)
  2. The merged plan contains 2–3 restaurant alternatives and a sorted timeline of all events
  3. Cost breakdown shows: original price → after GIRF → after card offer → after DineCash → final + total savings
  4. A timing conflict (Instamart window vs reservation) is automatically resolved by adjusting delivery ±15 min; user sees the adjusted plan not an error
  5. Explicit user confirmation is required before any booking or order is placed; the confirmation step summarises restaurant, gifts, timeline, and total cost
**Plans**: TBD

### Phase 6: Frontend
**Goal**: The full chat interface is live with Swiggy brand styling, agent status indicators during parallel runs, plan card, timeline diagram, cost breakdown, confirmation modal, household profile page, history page, and onboarding wizard
**Depends on**: Phase 5
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, PAGE-01, PAGE-02
**Success Criteria** (what must be TRUE):
  1. The chat interface renders with Swiggy orange (#FC8019), Inter font, card shadows, and brand radius — user and agent bubbles are visually distinct (orange/right vs gray/left)
  2. During an orchestrator run, agent status indicators show real-time state transitions (idle → running → done/error) for Food, Instamart, and Dineout
  3. The plan card displays restaurant options, gift items, and offer stack in a single scrollable view; the timeline diagram renders a sorted event list with Swiggy orange line and dots
  4. The cost breakdown component shows a visual step-down from original price through each offer stage to final cost and total savings
  5. The confirmation modal appears before any booking and the interface is fully usable at 375px viewport width
**Plans**: TBD
**UI hint**: yes

### Phase 7: Demo & Polish
**Goal**: A pre-seeded demo household enables the full anniversary demo flow in under 15 seconds P90, all error/loading/empty states are handled gracefully, and the application is deployed to Vercel and Railway
**Depends on**: Phase 6
**Requirements**: DEMO-01, DEMO-02, DEMO-03, DEMO-04, DEMO-05
**Success Criteria** (what must be TRUE):
  1. The demo household (wife: North Indian, no mushrooms, dark chocolate; HDFC card; DineCash ₹350) is pre-seeded and the full "anniversary Saturday surprise her" flow produces a plan without manual setup
  2. The end-to-end demo flow completes from first message to confirmed plan in under 15 seconds P90
  3. Each MCP failure type (food only, instamart only, dineout only, all three) shows a graceful degraded state with partial results and deeplink fallbacks — no white screens or unhandled exceptions
  4. Loading skeleton UI appears per agent during the parallel run; empty states show helpful prompts rather than blank panels
  5. The application is accessible at Vercel URL (frontend) and Railway URL (backend API) with working PostgreSQL and Upstash Redis
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Food Agent | 0/TBD | Not started | - |
| 3. Instamart Agent | 0/TBD | Not started | - |
| 4. Dineout Agent | 0/TBD | Not started | - |
| 5. Orchestrator | 0/TBD | Not started | - |
| 6. Frontend | 0/TBD | Not started | - |
| 7. Demo & Polish | 0/TBD | Not started | - |
