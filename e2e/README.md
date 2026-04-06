# E2E Tests

End-to-end tests using [Playwright](https://playwright.dev/) against the deployed QA environment.

## Prerequisites

```bash
# Install Playwright browsers (one-time)
npx playwright install chromium --with-deps
```

## Configuration

- **Test directory:** `e2e/`
- **Base URL:** QA environment (`data-qa.d2ejnrofktz23t.amplifyapp.com`)
- **Browser:** Chromium
- **Retries:** 1
- **Timeout:** 60s per test

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `E2E_USER_EMAIL` | Yes | Login email for QA environment |
| `E2E_USER_PASSWORD` | Yes | Login password for QA environment |
| `E2E_BASE_URL` | No | Override base URL (default: QA) |

## Running

```bash
# Set credentials
export E2E_USER_EMAIL="your-email@konovo.com"
export E2E_USER_PASSWORD="your-password"

# Run all tests
npm run test:e2e

# Run in interactive UI mode
npm run test:e2e:ui

# Run a specific test file
npx playwright test e2e/login.spec.ts

# Run only unauthenticated tests (no credentials needed)
npx playwright test --project=unauthenticated
```

## Test Structure

| File | Project | Description |
|------|---------|-------------|
| `auth.setup.ts` | setup | Authenticates and saves browser state |
| `login.spec.ts` | unauthenticated | Login form rendering, validation, error handling |
| `navigation.spec.ts` | unauthenticated + chromium | Route protection, sidebar navigation |
| `projects.spec.ts` | chromium | Project list, brand tabs, detail navigation |

### Projects

- **setup** — Runs `auth.setup.ts` to log in and save `e2e/.auth/user.json`
- **chromium** — Authenticated tests using saved storage state (depends on setup)
- **unauthenticated** — Tests that verify behavior without login (no dependencies)

## Notes

- E2E tests run against the deployed QA app, not local dev server
- Auth state is persisted in `e2e/.auth/` (gitignored)
- These tests are **not** part of Amplify CI — run manually or via GitHub Actions
