/**
 * UAT: Timeslots API
 *
 * Verifies Phase 4C features:
 * - List timeslots returns correct envelope
 * - Timeslot items have BE field names (startTime, endTime, etc.)
 * - Individual timeslot detail works with success() wrapper
 * - Available slots endpoint works
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiGet, assertListEnvelope, assertHasKeys } from "./helpers.mjs";

describe("Timeslots API", () => {
  it("GET /timeslots returns paginated envelope", async () => {
    const { status, body } = await apiGet("/timeslots", { pageSize: 5 });
    assert.equal(status, 200);
    assertListEnvelope(body, "ListTimeslots");
    assert.ok(body.meta.totalCount > 0, "Expected at least one timeslot");
  });

  it("timeslot items have required fields", async () => {
    const { body } = await apiGet("/timeslots", { pageSize: 3 });
    for (const ts of body.data) {
      assertHasKeys(
        ts,
        [
          "id",
          "projectId",
          "projectName",
          "startTime",
          "endTime",
          "duration",
          "statusId",
          "status",
          "confirmed",
          "source",
          "serviceCategory",
          "modifiedOn",
        ],
        `Timeslot ${ts.id}`
      );
    }
  });

  it("GET /timeslots/:id returns detail with success wrapper", async () => {
    const { body: list } = await apiGet("/timeslots", { pageSize: 1 });
    const first = list.data[0];
    const { status, body } = await apiGet(`/timeslots/${first.id}`);
    assert.equal(status, 200);
    assert.equal(body.success, true, "Expected success=true");
    assert.ok(body.data, "Expected data object");
    assertHasKeys(
      body.data,
      ["id", "projectId", "startTime", "endTime", "statusId"],
      `TimeslotDetail ${first.id}`
    );
  });

  it("GET /slots returns array of available slots", async () => {
    const { status, body } = await apiGet("/slots");
    assert.equal(status, 200);
    assert.ok(Array.isArray(body), "Expected array");
    // Available slots might be empty, that's fine
    if (body.length > 0) {
      assertHasKeys(body[0], ["id", "projectId", "startTime", "endTime"], "Slot 0");
    }
  });
});
