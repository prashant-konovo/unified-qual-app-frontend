/**
 * UAT: Bookings (Interviews) API
 *
 * Verifies Phase 4C features:
 * - List bookings returns correct envelope
 * - Booking items have required fields for interview display
 * - Status values map correctly
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiGet, assertListEnvelope, assertHasKeys } from "./helpers.mjs";

describe("Bookings API", () => {
  it("GET /bookings returns paginated envelope", async () => {
    const { status, body } = await apiGet("/bookings", { pageSize: 5 });
    assert.equal(status, 200);
    assertListEnvelope(body, "ListBookings");
  });

  it("booking items have required fields for interview display", async () => {
    const { body } = await apiGet("/bookings", { pageSize: 3 });
    if (body.data.length === 0) return; // No bookings is valid

    for (const b of body.data) {
      assertHasKeys(
        b,
        [
          "id",
          "projectId",
          "projectName",
          "startTime",
          "endTime",
          "statusId",
          "status",
          "responderId",
          "responderName",
          "source",
        ],
        `Booking ${b.id}`
      );
    }
  });

  it("booking status values are valid QS status names", async () => {
    const validStatuses = [
      "OPEN",
      "PENDING",
      "MOD_RESCHEDULED",
      "PART_RESCHEDULED",
      "MOD_CANCELLED",
      "PART_CANCELLED",
      "PENDING_MOD_COMPLETION",
      "NO_SHOW",
      "COMPLETED",
      "MOD_NO_SHOW",
      "PM_RESCHEDULED",
      "PM_CANCELLED",
    ];
    const { body } = await apiGet("/bookings", { pageSize: 10 });
    for (const b of body.data) {
      assert.ok(
        validStatuses.includes(b.status),
        `Invalid status "${b.status}" for booking ${b.id}`
      );
    }
  });

  it("bookings always have a respondent (filtered from timeslots)", async () => {
    const { body } = await apiGet("/bookings", { pageSize: 10 });
    for (const b of body.data) {
      assert.ok(b.responderId, `Booking ${b.id} missing responderId`);
      assert.ok(b.responderName, `Booking ${b.id} missing responderName`);
    }
  });
});
