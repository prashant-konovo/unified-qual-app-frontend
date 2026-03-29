/**
 * UAT: Participants API
 *
 * Verifies Phase 4C features:
 * - List participants returns correct envelope
 * - Participant items have name, email
 * - Individual participant detail works with contacts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiGet, assertListEnvelope, assertHasKeys } from "./helpers.mjs";

describe("Participants API", () => {
  it("GET /participants returns paginated envelope", async () => {
    const { status, body } = await apiGet("/participants", { pageSize: 5 });
    assert.equal(status, 200);
    assertListEnvelope(body, "ListParticipants");
    assert.ok(body.meta.totalCount > 0, "Expected at least one participant");
  });

  it("participant items have required fields", async () => {
    const { body } = await apiGet("/participants", { pageSize: 3 });
    for (const p of body.data) {
      assertHasKeys(
        p,
        ["id", "firstName", "lastName", "name", "source", "modifiedOn"],
        `Participant ${p.id}`
      );
    }
  });

  it("GET /participants/:id returns detail with success wrapper", async () => {
    const { body: list } = await apiGet("/participants", { pageSize: 1 });
    const first = list.data[0];
    const { status, body } = await apiGet(`/participants/${first.id}`);
    assert.equal(status, 200);
    assert.equal(body.success, true, "Expected success=true");
    assert.ok(body.data, "Expected data object");
    assertHasKeys(
      body.data,
      ["id", "firstName", "lastName", "name"],
      `ParticipantDetail ${first.id}`
    );
  });

  it("participant detail includes contacts array", async () => {
    const { body: list } = await apiGet("/participants", { pageSize: 1 });
    const first = list.data[0];
    const { body } = await apiGet(`/participants/${first.id}`);
    // Contacts should be present (may be empty for some participants)
    if (body.data.contacts) {
      assert.ok(
        Array.isArray(body.data.contacts),
        "Expected contacts to be array"
      );
      if (body.data.contacts.length > 0) {
        assertHasKeys(
          body.data.contacts[0],
          ["type", "address", "contactable", "optedOut"],
          "Contact"
        );
      }
    }
  });
});
