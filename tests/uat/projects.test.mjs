/**
 * UAT: Projects API
 *
 * Verifies Phase 4A features:
 * - List projects returns correct envelope
 * - Projects have serviceCategory (LS/MRA)
 * - Individual project detail works
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiGet, assertListEnvelope, assertHasKeys } from "./helpers.mjs";

describe("Projects API", () => {
  it("GET /projects returns paginated envelope", async () => {
    const { status, body } = await apiGet("/projects", { pageSize: 5 });
    assert.equal(status, 200);
    assertListEnvelope(body, "ListProjects");
    assert.ok(body.meta.totalCount > 0, "Expected at least one project");
  });

  it("projects have required fields", async () => {
    const { body } = await apiGet("/projects", { pageSize: 3 });
    for (const p of body.data) {
      assertHasKeys(
        p,
        ["id", "name", "status", "source", "serviceCategory", "createdAt"],
        `Project ${p.id}`
      );
      assert.ok(
        ["LS", "MRA"].includes(p.serviceCategory),
        `Invalid serviceCategory: ${p.serviceCategory}`
      );
      assert.ok(
        ["qs", "iris"].includes(p.source),
        `Invalid source: ${p.source}`
      );
    }
  });

  it("GET /projects?serviceCategory=LS filters correctly", async () => {
    const { body } = await apiGet("/projects", { serviceCategory: "LS" });
    for (const p of body.data) {
      assert.equal(p.serviceCategory, "LS", `Expected LS, got ${p.serviceCategory}`);
    }
  });

  it("GET /projects?serviceCategory=MRA filters correctly", async () => {
    const { body } = await apiGet("/projects", { serviceCategory: "MRA" });
    for (const p of body.data) {
      assert.equal(p.serviceCategory, "MRA", `Expected MRA, got ${p.serviceCategory}`);
    }
  });

  it("GET /project/:id returns detail", async () => {
    const { body: list } = await apiGet("/projects", { pageSize: 1 });
    const first = list.data[0];
    const { status, body } = await apiGet(`/project/${first.id}`, {
      source: first.source,
    });
    assert.equal(status, 200);
    // Detail uses success() wrapper
    assert.equal(body.success, true, "Expected success=true");
    assert.ok(body.data, "Expected data object");
    assertHasKeys(body.data, ["id", "name"], `ProjectDetail ${first.id}`);
  });
});
