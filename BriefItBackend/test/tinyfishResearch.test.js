const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  enrichProblem,
  searchWeb,
  buildQuery,
  isEnabled,
} = require("../src/services/tinyfishResearch");
const Problem = require("../src/models/problem");

const silentLogger = { error() {}, log() {} };
const ENV = { TINYFISH_API_KEY: "test-key" };

function okFetch(body, calls = []) {
  return async (url, options) => {
    calls.push({ url, options });
    return { ok: true, status: 200, json: async () => body };
  };
}

function fakeModel(problem) {
  const updates = [];
  return {
    updates,
    findById: async () => problem,
    findByIdAndUpdate: async (id, update) => {
      updates.push({ id, update });
    },
  };
}

const problem = {
  title: "  Broken   handpump ",
  category: "water",
  isDuplicate: false,
  location: { district: "Jaipur" },
};

test("isEnabled is false without a key and true with one", () => {
  assert.equal(isEnabled({}), false);
  assert.equal(isEnabled({ TINYFISH_API_KEY: "  " }), false);
  assert.equal(isEnabled(ENV), true);
});

test("buildQuery combines title, district and category", () => {
  assert.equal(buildQuery(problem), "Broken handpump Jaipur water");
  assert.equal(
    buildQuery({ title: "x", category: "urban_development", location: {} }),
    "x urban development",
  );
});

test("searchWeb sends X-API-Key and params, and normalizes results", async () => {
  const calls = [];
  const sources = await searchWeb("q", {
    purpose: "why",
    env: { ...ENV, TINYFISH_MAX_RESULTS: "2" },
    fetchImpl: okFetch(
      {
        results: [
          { title: "A", url: "https://a.test", snippet: "sa", site_name: "a.test", date: "2026-01-01" },
          { url: "https://b.test", site_name: "b.test" },
          { title: "C", url: "https://c.test" },
          { title: "no url" },
        ],
      },
      calls,
    ),
  });

  assert.equal(calls.length, 1);
  const url = new URL(calls[0].url);
  assert.equal(url.origin, "https://api.search.tinyfish.ai");
  assert.equal(url.searchParams.get("query"), "q");
  assert.equal(url.searchParams.get("location"), "IN");
  assert.equal(url.searchParams.get("purpose"), "why");
  assert.equal(calls[0].options.headers["X-API-Key"], "test-key");

  assert.equal(sources.length, 2); // capped by TINYFISH_MAX_RESULTS
  assert.deepEqual(sources[0], {
    title: "A",
    url: "https://a.test",
    snippet: "sa",
    siteName: "a.test",
    publishedAt: "2026-01-01",
  });
  assert.equal(sources[1].title, "b.test"); // falls back to site_name
});

test("searchWeb throws on non-2xx and when key missing", async () => {
  await assert.rejects(
    searchWeb("q", {
      env: ENV,
      fetchImpl: async () => ({ ok: false, status: 429, json: async () => ({}) }),
    }),
    /HTTP 429/,
  );
  await assert.rejects(searchWeb("q", { env: {} }), /TINYFISH_API_KEY/);
});

test("enrichProblem is a no-op when disabled (no fetch, no DB)", async () => {
  const model = fakeModel(problem);
  let fetched = false;
  const result = await enrichProblem("id1", {
    env: {},
    Model: model,
    fetchImpl: async () => {
      fetched = true;
    },
    logger: silentLogger,
  });
  assert.equal(result, null);
  assert.equal(fetched, false);
  assert.equal(model.updates.length, 0);
});

test("enrichProblem stores completed webContext", async () => {
  const model = fakeModel(problem);
  const result = await enrichProblem("id1", {
    env: ENV,
    Model: model,
    fetchImpl: okFetch({ results: [{ title: "A", url: "https://a.test", snippet: "s" }] }),
    logger: silentLogger,
  });
  assert.equal(result.status, "completed");
  assert.equal(model.updates.length, 1);
  assert.equal(model.updates[0].id, "id1");
  assert.equal(model.updates[0].update.webContext.sources[0].url, "https://a.test");
});

test("enrichProblem records failure instead of throwing", async () => {
  const model = fakeModel(problem);
  const result = await enrichProblem("id1", {
    env: ENV,
    Model: model,
    fetchImpl: async () => {
      throw new Error("network down");
    },
    logger: silentLogger,
  });
  assert.equal(result.status, "failed");
  assert.match(result.error, /network down/);
  assert.deepEqual(model.updates[0].update.webContext.sources, []);
});

test("enrichProblem skips duplicates and missing problems", async () => {
  const dup = fakeModel({ ...problem, isDuplicate: true });
  assert.equal(await enrichProblem("x", { env: ENV, Model: dup, logger: silentLogger }), null);
  const missing = fakeModel(null);
  assert.equal(await enrichProblem("x", { env: ENV, Model: missing, logger: silentLogger }), null);
  assert.equal(dup.updates.length + missing.updates.length, 0);
});

test("enrichProblem never throws even if the DB fails", async () => {
  const model = {
    findById: async () => {
      throw new Error("db down");
    },
  };
  assert.equal(await enrichProblem("x", { env: ENV, Model: model, logger: silentLogger }), null);
});

test("Problem model: webContext is optional and validates when present", async () => {
  const base = {
    title: "t",
    description: "d",
    location: { district: "Jaipur" },
    submittedBy: "507f1f77bcf86cd799439011",
  };
  const plain = new Problem(base);
  assert.equal(plain.webContext, undefined); // existing behavior unchanged
  assert.equal(plain.validateSync(), undefined);

  const enriched = new Problem({
    ...base,
    webContext: { status: "completed", query: "q", sources: [{ title: "A", url: "https://a.test" }] },
  });
  assert.equal(enriched.validateSync(), undefined);

  const bad = new Problem({ ...base, webContext: { status: "bogus" } });
  assert.ok(bad.validateSync());
});
