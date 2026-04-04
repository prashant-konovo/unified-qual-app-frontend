# Unified Qual Frontend — Next.js

Frontend for the Unified Qualitative Research platform.  
Next.js 16 + Turbopack. Deployed to AWS Amplify (data-qa).

## Tech Stack
- **Next.js 16** (Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Axios** for API calls (proxied through Next.js rewrites)

## Local Development (data-qa)

### Prerequisites
- Node.js 18+
- Go backend running on `localhost:8080` (see backend README for SSM tunnel setup)

### 1. Install Dependencies (first time only)

```bash
npm install
```

### 2. Create `.env.local`

```env
BACKEND_URL=http://localhost:8080
```

This tells Next.js to proxy `/api/backend/*` requests to the local Go backend instead of the EKS load balancer.

### 3. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** First page load takes ~40-60 seconds (Turbopack initial compile). Subsequent navigations are fast.

### How API Proxying Works

```
Browser → localhost:3000/api/backend/projects
  → Next.js rewrite (next.config.ts)
    → BACKEND_URL/v1/projects
      → localhost:8080/v1/projects (local Go backend)
```

- `next.config.ts` has a rewrite rule: `/api/backend/:path*` → `${BACKEND_URL}/v1/:path*`
- If `BACKEND_URL` is not set, falls back to the EKS load balancer URL
- This avoids mixed-content issues (HTTPS frontend → HTTP backend)

### Auth Flow (Local)

- Login page at `/login` — Email/password form + "Sign in with SSO" button
- SSO redirects to Cognito Hosted UI (`admin-dev-auth.incrowdanswers.com`)
- Cognito redirects back to `http://localhost:3000/login/sso-callback`
- Tokens stored in `localStorage` (`auth_tokens`, `ic_credentials`)
- `auth_active` cookie controls middleware redirect to `/login`
- Automatic token refresh 5 min before JWT expiry

> **SSO requirement:** `http://localhost:3000/login/sso-callback` must be in Cognito app client's allowed callback URLs (already configured for client `58jab4p7v2abqvfcvar45e3gc8`).

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `BACKEND_URL` | `http://localhost:8080` | API proxy target (server-side only, not exposed to browser) |

## Deploy (Amplify)

Amplify CI/CD is connected to the `data-qa` branch. Push triggers auto-build + deploy.

```
git push → Amplify CI/CD (lint → build → deploy)
```

## Project Structure

```
app/
  login/          — Login page + SSO callback
  dashboard/      — KPI cards, project breakdown, recent bookings
  projects/       — Project list + detail (LS/MRA tabs)
  interviews/     — Interview dashboard
  ...
components/
  app-sidebar.tsx — Role-filtered navigation
  role-guard.tsx  — Page-level access control
lib/
  auth-context.tsx — Auth state, token refresh, role mapping
  token-manager.ts — Token storage, JWT parsing, role extraction
  axios.ts         — API client with auth headers + 401 handling
  api/             — Domain API modules (projects, surveys, bookings, etc.)
```

## Testing

Component tests use **Vitest** + **React Testing Library** (jsdom). 16 tests across 3 files.

```bash
npm test              # Run all component tests
npm run test:watch    # Watch mode (re-runs on file change)
npm run test:e2e      # Run Playwright E2E tests
```

**Test files:**
- `components/role-guard.test.tsx` — 6 tests (role rendering, fallback, loading, no user)
- `components/app-sidebar.test.tsx` — 4 tests (admin/manager/moderator/unauthenticated nav filtering)
- `app/login/login.test.tsx` — 6 tests (form fields, buttons, title, input types)

**Mocks** (`lib/__mocks__/`):
- `auth-context.tsx` — Configurable `useAuth()` mock with `setMockUser()`, `setMockIsLoading()`
- `axios.ts` — Mock API client (prevents real HTTP calls)

Tests run automatically in Amplify CI preBuild phase.

## Security Scanning (Snyk)

Snyk runs automatically in the Amplify preBuild phase:
- **Dependency scan:** `snyk test --severity-threshold=high`
- **SAST:** `snyk code test`
- **Monitor:** `snyk monitor` (uploads snapshot to Snyk dashboard)

Currently **non-blocking** (`|| true`). Remove to enforce after baseline is clean.

`SNYK_TOKEN` must be set as an Amplify Console environment variable (App Settings → Environment Variables).

To run locally:

```bash
export SNYK_TOKEN=<your-token>
npx snyk test
npx snyk code test
```
