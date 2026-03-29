/**
 * UAT Test Helpers
 *
 * Shared utilities for UAT tests.
 * Uses Node.js built-in fetch (18+) — zero external dependencies.
 */

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "http://a6e1211d45bda4b32b51f6b2d278bce7-1983641930.us-east-2.elb.amazonaws.com";

const AUTH_EMAIL = process.env.AUTH_EMAIL || "subsdataqa+3@gmail.com";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "TestQual@2026!";

let _cachedToken = null;

/**
 * Authenticate and return a Bearer token.
 * Caches across calls within the same process.
 */
export async function getToken() {
  if (_cachedToken) return _cachedToken;

  const res = await fetch(`${BACKEND_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD }),
  });

  if (!res.ok) throw new Error(`Login failed: ${res.status}`);

  const data = await res.json();
  _cachedToken = data.AccessToken || data.idToken || data.access_token;
  if (!_cachedToken) throw new Error("No token in login response");
  return _cachedToken;
}

/**
 * Make an authenticated GET request and return parsed JSON.
 */
export async function apiGet(path, params = {}) {
  const token = await getToken();
  const url = new URL(`${BACKEND_URL}/v1${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  return { status: res.status, body: await res.json() };
}

/**
 * Make an authenticated POST request.
 */
export async function apiPost(path, payload) {
  const token = await getToken();
  const res = await fetch(`${BACKEND_URL}/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return { status: res.status, body: await res.json() };
}

/**
 * Assert that an object has all specified keys.
 */
export function assertHasKeys(obj, keys, label = "") {
  const missing = keys.filter((k) => !(k in obj));
  if (missing.length > 0) {
    throw new Error(
      `${label ? label + ": " : ""}Missing keys: ${missing.join(", ")}. Got: ${Object.keys(obj).join(", ")}`
    );
  }
}

/**
 * Assert that a response follows the list envelope format:
 * { success: true, data: [...], meta: { page, pageSize, totalCount } }
 */
export function assertListEnvelope(body, label = "") {
  const prefix = label ? `${label}: ` : "";
  if (body.success !== true)
    throw new Error(`${prefix}Expected success=true, got ${body.success}`);
  if (!Array.isArray(body.data))
    throw new Error(`${prefix}Expected data to be array, got ${typeof body.data}`);
  if (!body.meta || typeof body.meta !== "object")
    throw new Error(`${prefix}Expected meta object`);
  assertHasKeys(body.meta, ["page", "pageSize", "totalCount"], `${prefix}meta`);
}
