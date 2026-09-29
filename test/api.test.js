// Runs in its own process (node --test isolates files), so the key applies
// before the server module reads it.
process.env.EQUITY_LENS_API_KEY = "test-key";

const { test, before, after } = require("node:test");
const assert = require("node:assert");
const app = require("../equity-lens-RESTapi-server.js");

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const auth = { authorization: "Bearer test-key", "content-type": "application/json" };

test("health is public", async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, "ok");
});

test("protected routes reject a missing or wrong key", async () => {
  assert.strictEqual((await fetch(`${base}/domains`)).status, 401);
  const wrong = await fetch(`${base}/domains`, { headers: { authorization: "Bearer nope" } });
  assert.strictEqual(wrong.status, 401);
});

test("domains lists the evaluation domains with a valid key", async () => {
  const res = await fetch(`${base}/domains`, { headers: auth });
  assert.strictEqual(res.status, 200);
  assert.ok((await res.json()).domains.includes("Healthcare Access"));
});

test("evaluate validates its input before calling a model", async () => {
  const res = await fetch(`${base}/evaluate`, { method: "POST", headers: auth, body: "{}" });
  assert.strictEqual(res.status, 400);
});

test("evaluate sends the Anthropic key and version, and runs both prompts plus the judge", async () => {
  process.env.ANTHROPIC_API_KEY = "sk-test";
  const realFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, init) => {
    if (!String(url).startsWith("https://api.anthropic.com/")) return realFetch(url, init);
    calls.push(init.headers);
    const judge = JSON.parse(init.body).system;
    const text = judge ? JSON.stringify({ score: 3, verdict: "Just" }) : "a response";
    return new Response(JSON.stringify({ content: [{ type: "text", text }] }), { status: 200 });
  };
  try {
    const res = await realFetch(`${base}/evaluate`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ prompt_a: "A", prompt_b: "B" }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(calls.length, 3);
    for (const h of calls) {
      assert.strictEqual(h["x-api-key"], "sk-test");
      assert.strictEqual(h["anthropic-version"], "2023-06-01");
    }
  } finally {
    global.fetch = realFetch;
  }
});

test("evaluate reports a model API failure instead of scoring it", async () => {
  const realFetch = global.fetch;
  global.fetch = async (url, init) =>
    String(url).startsWith("https://api.anthropic.com/")
      ? new Response(JSON.stringify({ error: { message: "invalid x-api-key" } }), { status: 401 })
      : realFetch(url, init);
  try {
    const res = await realFetch(`${base}/evaluate`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ prompt_a: "A", prompt_b: "B" }),
    });
    assert.strictEqual(res.status, 500);
    assert.match((await res.json()).message, /401/);
  } finally {
    global.fetch = realFetch;
  }
});
