const { test } = require("node:test");
const assert = require("node:assert/strict");

const Problem = require("../src/models/problem");

// Stub Mongo-backed statics and the global fetch (Groq + TinyFish).
function setup({ tinyfishKey, isDuplicate = false, tinyfishFails = false }) {
  const original = {
    fetch: global.fetch,
    find: Problem.find,
    create: Problem.create,
    findById: Problem.findById,
    findByIdAndUpdate: Problem.findByIdAndUpdate,
    key: process.env.TINYFISH_API_KEY,
  };
  if (tinyfishKey) process.env.TINYFISH_API_KEY = tinyfishKey;
  else delete process.env.TINYFISH_API_KEY;
  process.env.GROQ_API_KEY = "groq-test";

  const stored = {
    _id: "p1",
    title: "Broken handpump",
    category: "water",
    isDuplicate,
    location: { district: "Jaipur" },
  };
  const seen = { tinyfish: 0, groq: 0, updates: [] };

  Problem.find = () => ({ select: () => ({ limit: async () => [] }) });
  Problem.create = async (doc) => ({ ...stored, ...doc, _id: "p1" });
  Problem.findById = async () => stored;
  Problem.findByIdAndUpdate = async (id, update) => {
    seen.updates.push(update);
  };
  global.fetch = async (url) => {
    if (String(url).includes("groq.com")) {
      seen.groq++;
      return {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  category: "water",
                  rank: 4,
                  aiTags: ["handpump"],
                  isDuplicate,
                  duplicateOf: null,
                }),
              },
            },
          ],
        }),
      };
    }
    seen.tinyfish++;
    if (tinyfishFails) throw new Error("boom");
    return {
      ok: true,
      status: 200,
      json: async () => ({ results: [{ title: "Scheme", url: "https://gov.test/s", snippet: "x" }] }),
    };
  };

  const restore = () => {
    global.fetch = original.fetch;
    Problem.find = original.find;
    Problem.create = original.create;
    Problem.findById = original.findById;
    Problem.findByIdAndUpdate = original.findByIdAndUpdate;
    if (original.key === undefined) delete process.env.TINYFISH_API_KEY;
    else process.env.TINYFISH_API_KEY = original.key;
  };
  return { seen, restore };
}

async function submit() {
  const { createProblem } = require("../src/controllers/problem.controller");
  const out = {};
  const res = {
    status(code) {
      out.status = code;
      return this;
    },
    json(body) {
      out.body = body;
    },
  };
  await createProblem(
    {
      body: {
        title: "Broken handpump",
        description: "No water",
        location: { district: "Jaipur" },
        submittedBy: "507f1f77bcf86cd799439011",
      },
    },
    res,
  );
  // let the fire-and-forget enrichment finish
  await new Promise((r) => setTimeout(r, 50));
  return out;
}

test("with a key: response is unchanged and webContext is saved in background", async () => {
  const { seen, restore } = setup({ tinyfishKey: "k" });
  try {
    const out = await submit();
    assert.equal(out.status, 201);
    assert.equal(out.body.success, true);
    assert.equal(out.body.problem.category, "water");
    assert.equal(out.body.problem.webContext, undefined);
    assert.equal(seen.tinyfish, 1);
    assert.equal(seen.updates[0].webContext.status, "completed");
    assert.equal(seen.updates[0].webContext.sources[0].url, "https://gov.test/s");
  } finally {
    restore();
  }
});

test("without a key: TinyFish is never called; behavior identical to before", async () => {
  const { seen, restore } = setup({ tinyfishKey: null });
  try {
    const out = await submit();
    assert.equal(out.status, 201);
    assert.equal(seen.tinyfish, 0);
    assert.equal(seen.updates.length, 0);
  } finally {
    restore();
  }
});

test("TinyFish failure never affects the 201 response", async () => {
  const { seen, restore } = setup({ tinyfishKey: "k", tinyfishFails: true });
  const origErr = console.error;
  console.error = () => {};
  try {
    const out = await submit();
    assert.equal(out.status, 201);
    assert.equal(seen.updates[0].webContext.status, "failed");
  } finally {
    console.error = origErr;
    restore();
  }
});

test("duplicate (rejected) problems are not enriched", async () => {
  const { seen, restore } = setup({ tinyfishKey: "k", isDuplicate: true });
  try {
    const out = await submit();
    assert.equal(out.status, 201);
    assert.equal(out.body.problem.status, "rejected");
    assert.equal(seen.tinyfish, 0);
  } finally {
    restore();
  }
});
