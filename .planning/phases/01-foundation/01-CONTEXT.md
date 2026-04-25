# Phase 1: Foundation - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning
**Mode:** Auto-generated (discuss skipped — YOLO mode)

<domain>
## Phase Boundary

Scaffold the full-stack Plus-One project (Next.js 15 frontend + API routes), establish the TypeScript type system and Drizzle DB schema for household profiles, implement household CRUD API endpoints, build the 3-question onboarding wizard backend, and provide a household.json dev fallback. All subsequent phases import household context from this foundation.

</domain>

<decisions>
## Implementation Decisions

### Project Structure
- Single Next.js 15 app (App Router) with API routes — no separate Fastify process for demo simplicity
- API routes in `app/api/` matching SPEC contracts exactly (POST /api/chat, GET/POST /api/household, POST /api/confirm)
- All agent code in `lib/agents/` — importable from API routes
- TypeScript throughout; strict mode enabled

### Database
- Drizzle ORM with PostgreSQL (Neon/Supabase connection string via DATABASE_URL env var)
- household.json fallback when DATABASE_URL is not set (dev mode)
- Redis via Upstash (REDIS_URL env var) for session state; in-memory Map fallback for dev

### Household Schema
- Follows SPEC §A exactly: HouseholdProfile, HouseholdMember, PaymentCard, Occasion, LearnedPattern
- Stored as JSONB columns for member arrays (simpler than normalized tables for MVP)
- household_id = "hh_{userId}" pattern

### Onboarding
- 3-question wizard: members → dietary constraints → payment cards
- POST /api/household creates profile; PATCH /api/household/:id updates
- Returns household object on all write operations

### Claude's Discretion
- Component library: shadcn/ui installed but minimal in Phase 1 (just for onboarding form if needed)
- Error handling: standard try/catch, return { error: string, status: number }

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project

### Established Patterns
- None yet — establishing patterns in this phase

### Integration Points
- All subsequent phases import `getHousehold(householdId)` from `lib/household.ts`
- Agents receive `HouseholdProfile` as parameter

</code_context>

<specifics>
## Specific Ideas

- Demo household pre-seed function: `lib/demo-seed.ts` exports `seedDemoHousehold()`
- household.json lives at `data/household.json` (gitignored for production, committed for demo)
- Environment: `.env.local` with ANTHROPIC_API_KEY, DATABASE_URL, REDIS_URL, NEXT_PUBLIC_APP_URL

</specifics>

<deferred>
## Deferred Ideas

- Full normalized DB schema with separate member/card tables (post-MVP)
- Auth/multi-user support (Builders Club demo is single-user)

</deferred>
