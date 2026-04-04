# E2E Tests

End-to-end tests using [Playwright](https://playwright.dev/).

## Status

E2E tests are planned but not yet implemented. The `playwright.config.ts` in the project root is configured and ready.

## Configuration

- **Test directory:** `e2e/`
- **Base URL:** QA environment (`data-qa.d2ejnrofktz23t.amplifyapp.com`)
- **Browser:** Chromium
- **Retries:** 1
- **Timeout:** 60s per test

## Running

```bash
npx playwright test
npx playwright test --ui  # Interactive mode
```
