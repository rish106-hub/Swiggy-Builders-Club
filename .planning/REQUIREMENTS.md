# Requirements: Plus-One

**Defined:** 2026-04-25
**Core Value:** A household completes a full occasion plan — restaurant booked, gifts timed, offers stacked — without leaving Plus-One.

## v1 Requirements

### Household Profile

- [ ] **HH-01**: User can complete a 3-question onboarding wizard that creates a household profile (members, dietary constraints, payment cards)
- [ ] **HH-02**: User can add household members with names, roles, and dietary constraints (vegetarian/Jain/diabetic-friendly/gluten-free/etc.)
- [ ] **HH-03**: User can add payment cards (bank, type) for offer stacking
- [ ] **HH-04**: Household profile persists across sessions (PostgreSQL primary, household.json dev fallback)
- [ ] **HH-05**: Household profile is loaded into every agent invocation before planning begins
- [ ] **HH-06**: Household profile updates after confirmed occasion execution (only from verified MCP data, never from user claims)

### Occasion Planning

- [ ] **OCC-01**: User can describe an occasion in natural language and receive a structured multi-vertical plan
- [ ] **OCC-02**: Orchestrator detects occasion context (type, date, members involved, intent) from user message
- [ ] **OCC-03**: Orchestrator runs Food Agent, Instamart Agent, and Dineout Agent in parallel (Promise.all)
- [ ] **OCC-04**: Orchestrator merges results from all 3 agents into a single coherent plan
- [ ] **OCC-05**: Plan presents 2–3 restaurant alternatives (never just 1, never more than 3)
- [ ] **OCC-06**: Plan includes a sorted timeline of all events (depart, arrive, delivery, milestones)
- [ ] **OCC-07**: Plan includes full cost breakdown: original → after GIRF → after card offer → after DineCash → final + total savings
- [ ] **OCC-08**: User sees agent status indicators (Food/Instamart/Dineout: idle/running/done/error) in real time

### Conflict Resolution

- [ ] **CONF-01**: Timing conflict (Instamart window vs reservation) resolved by adjusting delivery ±15 min
- [ ] **CONF-02**: Availability conflict (restaurant not in Dineout) triggers Food Agent re-search
- [ ] **CONF-03**: Budget conflict proposes downgrade option or asks user for limit increase

### Food Agent

- [ ] **FOOD-01**: Food Agent searches restaurants matching occasion, cuisine, ambiance, party size, budget, and household dietary exclusions
- [ ] **FOOD-02**: Food Agent returns structured JSON with match_score and reasoning per restaurant
- [ ] **FOOD-03**: Food Agent handles MCP timeout with partial result + degraded flag (never hard fail)

### Instamart Agent

- [ ] **IM-01**: Instamart Agent searches occasion items (cakes, flowers, gifts) respecting household preferences and budget
- [ ] **IM-02**: Instamart Agent schedules deliveries relative to reservation: flowers 15-20 min before, cake 15 min after reservation start
- [ ] **IM-03**: Instamart Agent returns delivery plan with target times and ±15 min window (never promises exact time)
- [ ] **IM-04**: Instamart Agent handles MCP timeout with partial result + deeplink fallback

### Dineout Agent

- [ ] **DO-01**: Dineout Agent checks table availability for a specific restaurant, date, time, and party size
- [ ] **DO-02**: Dineout Agent retrieves and stacks offers in correct order: GIRF → card offer → DineCash (invariant INV-6)
- [ ] **DO-03**: Dineout Agent calculates net effective price after full offer stack
- [ ] **DO-04**: Dineout Agent books table only after explicit user confirmation ("yes" / "confirm" in chat)
- [ ] **DO-05**: If `book_table` fails, Dineout Agent returns deeplink for user to complete in-app (never blocks plan)

### Confirmation & Execution

- [ ] **EXEC-01**: No booking or order is placed without explicit user confirmation step
- [ ] **EXEC-02**: Confirmation modal summarises plan (restaurant, gifts, timeline, total cost) before user commits
- [ ] **EXEC-03**: After confirmed execution, system returns full confirmation with timeline and any partial failure flags
- [ ] **EXEC-04**: Quick reply chips offered: "Yes, book it" / "Show alternatives" / "Change restaurant"

### Chat Interface

- [ ] **UI-01**: Chat interface uses Swiggy brand kit (FC8019 orange, Inter font, card-shadow, brand radius)
- [ ] **UI-02**: User message bubbles: orange background, right-aligned. Agent bubbles: gray-100 background, left-aligned
- [ ] **UI-03**: Timeline diagram component renders sorted events with Swiggy orange line and dots
- [ ] **UI-04**: Cost breakdown component shows original → after each offer step → final (visual step-down)
- [ ] **UI-05**: Agent status indicators shown during parallel agent run
- [ ] **UI-06**: Plan card component shows restaurant + gifts + offers in one view
- [ ] **UI-07**: Interface is mobile-responsive (primary viewport 375px)

### Household & History Pages

- [ ] **PAGE-01**: Household profile page lets user view/edit members, constraints, and cards
- [ ] **PAGE-02**: Order history page shows past occasions with restaurant, cost, savings, and outcome

### Demo & Polish

- [ ] **DEMO-01**: Demo household pre-seeded (wife: North Indian, no mushrooms, dark chocolate; HDFC card; DineCash ₹350)
- [ ] **DEMO-02**: Full anniversary demo flow works end-to-end: "anniversary Saturday surprise her" → plan → confirm → timeline
- [ ] **DEMO-03**: Orchestrator P90 response time < 15 seconds
- [ ] **DEMO-04**: Graceful error states for each MCP failure type (food/instamart/dineout/all)
- [ ] **DEMO-05**: Loading skeleton UI per agent during parallel run

## v2 Requirements

### Proactive Suggestions

- **PROACT-01**: Agent proactively surfaces upcoming occasions from household history
- **PROACT-02**: Agent suggests plans for occasions it has learned (recurring anniversary, birthdays)

### Multi-Constraint Meal

- **MCM-01**: Parents-visiting flow handles multiple simultaneous dietary constraints (diabetic + Jain)
- **MCM-02**: Agent offers hybrid option (restaurant vs cook at home vs delivery)

### Notifications

- **NOTF-01**: Morning reminder on occasion day (email)
- **NOTF-02**: Delivery status updates from Instamart

### B2B / Household Admin

- **B2B-01**: Office/hostel pantry manager persona with multi-member order coordination
- **B2B-02**: Per-head cost splitting for group occasions

## Out of Scope

| Feature | Reason |
|---------|--------|
| Twitter/X posting | Not relevant to occasion coordination |
| Zomato / EazyDiner integration | Swiggy MCP only — thesis is Swiggy One moat |
| Mobile native app | Web only, mobile-responsive |
| Multi-household accounts | Single household MVP |
| Payment processing in Plus-One | User pays in Swiggy app |
| WhatsApp/SMS notifications | Email only, post-MVP |
| Subscription billing | Free for Builders Club demo |
| Menu calorie tracking | HealthifyMe territory |
| Scheduled recurring orders | Post-MVP |
| Restaurant admin dashboard | B2B, post-MVP |
| Analytics dashboard for users | Post-MVP |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HH-01 – HH-06 | Phase 1 | Pending |
| FOOD-01 – FOOD-03 | Phase 2 | Pending |
| IM-01 – IM-04 | Phase 3 | Pending |
| DO-01 – DO-05 | Phase 4 | Pending |
| OCC-01 – OCC-08, CONF-01 – CONF-03, EXEC-01 – EXEC-04 | Phase 5 | Pending |
| UI-01 – UI-07, PAGE-01 – PAGE-02 | Phase 6 | Pending |
| DEMO-01 – DEMO-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-25*
*Last updated: 2026-04-25 after initial definition*
