/**
 * UAT: Frontend API Layer Mapping
 *
 * Tests that the FE API layer correctly transforms BE responses
 * into the shapes expected by components. This catches the exact
 * category of bug that caused the Phase 4A/4B/4C UAT failures.
 *
 * Simulates what the FE API functions do: fetch → unwrap → map.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiGet, assertHasKeys } from "./helpers.mjs";

// ── Simulate FE mappers (must match lib/api/*.ts) ────────────────────────────

function unwrapList(body) {
  return Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body)
      ? body
      : [];
}

function unwrapOne(body) {
  return body?.data ?? body;
}

function mapTimeslot(raw) {
  return {
    id: String(raw.id ?? ""),
    start: raw.startTime ?? raw.start ?? "",
    end: raw.endTime ?? raw.end ?? "",
    moderatorId: String(raw.moderatorId ?? ""),
    moderatorName: raw.moderatorName ?? "",
    type:
      raw.type ??
      (raw.responderId || raw.responderName ? "interview" : "availability"),
    projectId: raw.projectId != null ? String(raw.projectId) : undefined,
    project: raw.projectName ?? raw.project,
    participant: raw.responderName ?? raw.participant,
  };
}

function mapParticipant(raw) {
  return {
    id: String(raw.id ?? ""),
    name:
      (raw.name ??
        `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim()) || "",
    email: raw.email ?? "",
    phone: raw.phone,
    role: "participant",
    status: raw.status ?? "active",
  };
}

function mapBookingStatus(raw) {
  const status = String(raw.status ?? "").toUpperCase();
  if (status === "COMPLETED") return "completed";
  if (status.includes("CANCEL")) return "cancelled";
  if (status.includes("NO_SHOW")) return "no_show";
  return "scheduled";
}

function mapEnrichedBooking(raw) {
  return {
    id: String(raw.id ?? ""),
    slotId: String(raw.id ?? raw.slotId ?? ""),
    slotStart: raw.startTime ?? raw.slotStart ?? "",
    slotEnd: raw.endTime ?? raw.slotEnd ?? "",
    moderatorId: String(raw.moderatorId ?? ""),
    moderatorName: raw.moderatorName ?? "",
    participantName: raw.responderName ?? raw.participantName ?? "Unknown",
    projectId: String(raw.projectId ?? ""),
    projectName: raw.projectName ?? "",
    userId: String(raw.responderId ?? raw.userId ?? ""),
    status: mapBookingStatus(raw),
  };
}

function mapModerator(raw) {
  return {
    ...raw,
    name:
      (raw.name ??
        `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim()) || "",
    role: raw.role ?? raw.roles?.[0] ?? "moderator",
    status: raw.status ?? "active",
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("FE API Layer: Timeslots mapping", () => {
  it("unwraps envelope and maps to Timeslot interface", async () => {
    const { body } = await apiGet("/timeslots", { pageSize: 3 });
    const mapped = unwrapList(body).map(mapTimeslot);

    assert.ok(Array.isArray(mapped), "Expected array");
    assert.ok(mapped.length > 0, "Expected items");

    for (const ts of mapped) {
      assert.equal(typeof ts.id, "string", "id should be string");
      assert.ok(ts.start, "start should be non-empty");
      assert.ok(ts.end, "end should be non-empty");
      assert.ok(
        ["availability", "interview"].includes(ts.type),
        `type should be availability or interview, got: ${ts.type}`
      );
    }
  });
});

describe("FE API Layer: Participants mapping", () => {
  it("unwraps envelope and maps to Participant interface", async () => {
    const { body } = await apiGet("/participants", { pageSize: 3 });
    const mapped = unwrapList(body).map(mapParticipant);

    assert.ok(Array.isArray(mapped), "Expected array");
    assert.ok(mapped.length > 0, "Expected items");

    for (const p of mapped) {
      assert.equal(typeof p.id, "string", "id should be string");
      assert.ok(p.name, `name should be non-empty, got: "${p.name}"`);
      assert.equal(p.role, "participant");
      assert.ok(["active", "inactive"].includes(p.status));
    }
  });
});

describe("FE API Layer: Bookings mapping", () => {
  it("unwraps envelope and maps to EnrichedBooking interface", async () => {
    const { body } = await apiGet("/bookings", { pageSize: 3 });
    const mapped = unwrapList(body).map(mapEnrichedBooking);

    assert.ok(Array.isArray(mapped), "Expected array");
    for (const b of mapped) {
      assert.equal(typeof b.id, "string", "id should be string");
      assert.ok(b.slotStart, "slotStart should be non-empty");
      assert.ok(b.slotEnd, "slotEnd should be non-empty");
      assert.ok(b.participantName, "participantName should be non-empty");
      assert.ok(
        ["scheduled", "completed", "cancelled", "no_show"].includes(b.status),
        `Invalid mapped status: ${b.status}`
      );
    }
  });
});

describe("FE API Layer: Moderators mapping", () => {
  it("maps list items to Moderator interface", async () => {
    const { body } = await apiGet("/moderators");
    const items = Array.isArray(body) ? body : [];
    const mapped = items.slice(0, 5).map(mapModerator);

    assert.ok(mapped.length > 0, "Expected items");
    for (const m of mapped) {
      assert.ok(m.name, `name should be non-empty, got: "${m.name}"`);
      assert.ok(m.email, "email should be non-empty");
      assert.ok(m.role, "role should be non-empty");
      assert.ok(["active", "inactive"].includes(m.status));
    }
  });

  it("maps detail response to Moderator interface", async () => {
    const { body: list } = await apiGet("/moderators");
    const first = list[0];
    const { body } = await apiGet(`/moderators/${first.id}`, {
      source: first.source,
    });
    const mapped = mapModerator(body);

    assert.ok(mapped.name, "name should be non-empty");
    assert.ok(mapped.email, "email should be non-empty");
  });
});
