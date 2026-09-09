import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { spawn, ChildProcess } from "node:child_process";

const BASE_URL = "http://localhost:3001";
let server: ChildProcess;

beforeEach(async () => {
  server = spawn("npx", ["tsx", "src/server.ts"], {
    env: { ...process.env, PORT: "3001" },
    stdio: "ignore",
  });
  await new Promise((r) => setTimeout(r, 1500));
});

afterEach(() => {
  server.kill();
});

async function api(path: string) {
  const res = await fetch(`${BASE_URL}${path}`);
  const body = await res.json();
  return { status: res.status, body };
}

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const { status, body } = await api("/api/health");
    assert.strictEqual(status, 200);
    assert.deepStrictEqual(body, { status: "ok" });
  });
});

describe("GET /api/message", () => {
  it("returns a greeting message", async () => {
    const { status, body } = await api("/api/message");
    assert.strictEqual(status, 200);
    assert.deepStrictEqual(body, { message: "Bonjour depuis l'API !" });
  });
});
