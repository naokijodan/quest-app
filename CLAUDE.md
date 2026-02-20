# Quest App - Game-style AI Workflow App

## Project Overview

Quest Appは、非エンジニア（子供〜高齢者）向けのゲーム風AIワークフローアプリ。タスクをRPGのクエストとして進め、AIの成果物を30秒で手に入れる体験を提供する。

**コンセプト:** Dify/n8n/Zapierが「何でもできるが設定が難しい」のに対し、Quest Appは「できることは限られるが、誰でも30秒で完成物が手に入る」。

**仮称:** Quest App（正式名称未定）

---

## Technical Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| UI | React + TypeScript | 19.x |
| Styling | TailwindCSS | 4.x |
| State | Zustand | 5.x |
| Auth/DB/Storage | Supabase | latest |
| AI | Anthropic SDK (@anthropic-ai/sdk) | latest |
| Rate Limit | @upstash/ratelimit + @upstash/redis | latest |
| PWA | serwist (next-pwa successor) | latest |
| Validation | Zod | latest |
| Testing | Vitest + Playwright | latest |
| Deploy | Vercel | - |

---

## Directory Structure

```
quest-app/
├── public/
│   ├── icons/              # PWA icons
│   ├── sprites/            # Pixel art assets
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login, Register (unauthenticated)
│   │   ├── (main)/         # Authenticated pages
│   │   │   ├── page.tsx            # Home (quest list)
│   │   │   ├── quest/[id]/page.tsx # Quest detail
│   │   │   ├── history/page.tsx    # Run history
│   │   │   └── settings/page.tsx   # User settings
│   │   ├── api/quest/execute/route.ts  # Streaming API (only API Route)
│   │   ├── onboarding/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx                # Landing page
│   ├── features/
│   │   ├── quest/          # Quest components, hooks, services, actions
│   │   ├── auth/           # Auth components, hooks, services, actions
│   │   ├── user/           # User profile, level, avatar
│   │   ├── gamification/   # XP, level up, animations
│   │   └── onboarding/     # Character select, tutorial
│   ├── components/ui/      # Shared UI (Button, Card, Input, etc.)
│   ├── lib/
│   │   ├── supabase/       # client.ts, server.ts, middleware.ts
│   │   ├── anthropic/      # client.ts, stream.ts, templates.ts
│   │   ├── ratelimit/      # Upstash config
│   │   └── utils/          # cn.ts, format.ts
│   ├── stores/             # Zustand stores
│   ├── types/              # Global type definitions
│   └── hooks/              # Global hooks
├── supabase/
│   ├── migrations/         # DB migrations
│   └── seed.sql            # Preset quest data
├── tests/
│   ├── e2e/                # Playwright
│   ├── unit/               # Vitest
│   └── integration/        # API/DB tests
├── .env.local
└── CLAUDE.md               # This file
```

---

## Development Commands

```bash
# Dev server
npm run dev

# Testing
npm run test              # Unit tests (Vitest)
npm run test:e2e          # E2E tests (Playwright)

# Build
npm run build

# Lint
npm run lint

# Type check
npm run typecheck

# Supabase
npx supabase start        # Local Supabase
npx supabase db push       # Apply migrations
npx supabase gen types typescript --local > src/types/database.ts
```

---

## Architecture Rules

### API Design
- **Server Actions**: All data fetching/mutation (default)
- **API Route**: ONLY for quest execution streaming (`/api/quest/execute`)
- Never create additional API Routes unless streaming is required

### Auth Flow
```
Unauthenticated → /login
Authenticated + !onboarding_completed → /onboarding
Authenticated + onboarding_completed → /(main)
```

### Quest Execution Flow
```
Client → POST /api/quest/execute
  1. Auth check (Supabase session)
  2. Rate limit check (Upstash)
  3. Daily quota check (DB)
  4. Input validation (Zod)
  5. Create quest_run (status: 'running')
  6. Stream Anthropic API response (SSE)
  7. Save output, tokens, update XP
  8. Return complete event
```

### SSE Event Format
```typescript
{ type: 'start', quest_run_id: string }
{ type: 'delta', content: string }
{ type: 'progress', message: string }  // Mascot message
{ type: 'complete', quest_run_id: string, xp_gained: number, level_up: boolean }
{ type: 'error', message: string, retryable: boolean }
```

---

## DB Tables (Phase 1)

| Table | Purpose |
|-------|---------|
| users | User info, avatar, mascot, XP, level |
| preset_quests | 10 preset quest definitions |
| quest_runs | Execution history with partial_output |
| user_daily_quotas | Daily API call & token tracking |

### Key Constraints
- users.avatar_type: 'planner' | 'explorer' | 'crafter'
- users.mascot_type: 'cat' | 'dog'
- users.level: 1-3
- quest_runs.status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
- preset_quests.category: 'basic' | 'business' | 'life' | 'creative' | 'analysis'
- preset_quests.difficulty: 1-3

### RLS (All tables have RLS enabled)
- users: own data only
- preset_quests: read-only for all authenticated users
- quest_runs: own data only
- user_daily_quotas: own data only

---

## Gamification Constants

```
Level Thresholds: Lv.1=0XP, Lv.2=50XP, Lv.3=200XP
Difficulty XP:    ★=10, ★★=20, ★★★=40
Category Unlocks:
  Lv.1 → basic
  Lv.2 → basic, business, life
  Lv.3 → ALL (basic, business, life, creative, analysis)
```

---

## Rate Limits

| Plan | Daily Calls | Daily Tokens | Concurrent |
|------|------------|-------------|-----------|
| Free | 10 | 10,000 | 1 |
| Standard (¥980) | 100 | 100,000 | 1 |
| Pro (¥2,980) | unlimited | 500,000 | 3 |

Phase 1 = Free plan only. Stripe integration in Phase 2.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Preset Quests (10)

| # | ID | Title | Category | Diff | XP | Tokens |
|---|-----|-------|----------|------|----|--------|
| 1 | self-intro-v1 | Self Introduction | basic | 1 | 10 | 500 |
| 2 | email-draft-v1 | Email Draft | basic | 1 | 10 | 800 |
| 3 | sns-post-v1 | SNS Post | basic | 1 | 10 | 600 |
| 4 | announcement-v1 | Announcement | basic | 1 | 10 | 800 |
| 5 | meeting-summary-v1 | Meeting Summary | business | 1 | 20 | 1000 |
| 6 | daily-report-v1 | Daily Report | business | 2 | 20 | 1000 |
| 7 | presentation-v1 | Presentation | business | 2 | 20 | 1200 |
| 8 | travel-plan-v1 | Travel Plan | life | 2 | 20 | 1500 |
| 9 | book-review-v1 | Book Review | creative | 2 | 20 | 1000 |
| 10 | review-summary-v1 | Review Summary | analysis | 2 | 20 | 1000 |

---

## Phase Plan

### Phase 1: MVP (Current)
One-path success experience: Onboarding → Quest Execute → Result → Level Up

**Sprint 1 (Week 1-2):** Project setup, Auth, Middleware, UI components
**Sprint 2 (Week 3-4):** Onboarding, Home, Quest list
**Sprint 3 (Week 5-6):** Quest execution (streaming), Result display
**Sprint 4 (Week 7-8):** Gamification, History, PWA, E2E tests, Deploy

### Phase 2: Extension
Custom quests, Marketplace, Multi-AI, Stripe billing

### Phase 3: Platform
Scheduled execution, MCP/Zapier, Team features, Public API

---

## Code Conventions

### File Naming
- TypeScript: `kebab-case.ts`
- React Components: `PascalCase.tsx`
- Tests: `*.test.ts`, `*.spec.ts`
- Server Actions: `camelCase.ts` (in features/*/actions/)

### Commit Messages
```
feat: New feature
fix: Bug fix
refactor: Refactoring
test: Add tests
docs: Documentation
chore: Maintenance
perf: Performance
ci: CI/CD
```

### Test Coverage
- E2E: Main flow (onboarding → execute → result) = 100%
- Unit: lib/, features/*/services/ = 80%+
- Integration: API Routes = key paths

---

## Security Checklist

- [ ] No hardcoded secrets
- [ ] All user input validated with Zod (server-side)
- [ ] RLS enabled on all tables
- [ ] Anthropic API key server-only
- [ ] Supabase Service Role key server-only
- [ ] No dangerouslySetInnerHTML
- [ ] Prompt injection prevention (system/user prompt separation)
- [ ] Rate limiting on quest execution

---

## Session Handoff

When resuming in a new session:
1. Read this CLAUDE.md
2. Check `開発ログ/quest-app_*.md` for latest progress
3. Run `git log --oneline -10` to see recent changes
4. Run `npm run dev` to verify current state
5. Continue from the next incomplete sprint task

---

## Related Files

- **Design Doc:** `開発ログ/quest-app_開発設計書_Phase1_2026-02-21.md`
- **Concept HTML:** `~/Desktop/quest-app-concept/` (GitHub Pages)
- **Previous Notes:** `開発ログ/新プロジェクト_ゲーム風AIワークフローアプリ_2026-02-21.md`
- **Character Assets:** `~/Desktop/mascot-cat-and-dog.png`, `character-select-8bit.png`, `mage-girl-evolution.png`
