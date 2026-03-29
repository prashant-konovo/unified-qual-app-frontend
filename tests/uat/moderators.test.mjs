/**
 * UAT: Moderators API
 *
 * Verifies Phase 4B features:
 * - List moderators returns array (no envelope)
 * - Moderator items have required fields
 * - Individual moderator detail works
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiGet, assertHasKeys } from "./helpers.mjs";

describe("Moderators API", () => {
  it("GET /moderators returns array directly", async () => {
    const { status, body } = await apiGet("/moderators");
    assert.equal(status, 200);
    assert.ok(Array.isArray(body), "Expected array, got " + typeof body);
    assert.ok(body.length > 0, "Expected at least one moderator");
  });

  it("moderators have required fields", async () => {
    const { body } = await apiGet("/moderators");
    for (const m of body.slice(0, 5)) {
      assertHasKeys(
        m,
        ["id", "name", "email", "role", "status", "source", "serviceCategory"],
        `Moderator ${m.id}`
      );
    }
  });

  it("GET /moderators/:id returns detail with name fields", async () => {
    const { body: list } = await apiGet("/moderators");
    const first = list[0];
    const { status, body } = await apiGet(`/moderators/${first.id}`, {
      source: first.source,
    });
    assert.equal(status, 200);
    // GetModerator returns raw object (no envelope)
    assertHasKeys(body, ["id", "email"], `ModeratorDetail ${first.id}`);
    // Should have firstName/lastName or name
    const hasName =
      "name" in body || ("firstName" in body && "lastName" in body);
    assert.ok(hasName, "Expected name or firstName+lastName");
  });

  it("GET /moderators/:id/timeslots returns envelope", async () => {
    const { body: list } = await apiGet("/moderators");
    const first = list[0];
    const { status, body } = await apiGet(
      `/moderators/${first.id}/timeslots`,
      { pageSize: 3 }
    );
    assert.equal(status, 200);
    assert.equal(body.success, true, "Expected success=true");
    assert.ok(Array.isArray(body.data), "Expected data array");
    assert.ok(body.meta, "Expected meta");
  });
});
