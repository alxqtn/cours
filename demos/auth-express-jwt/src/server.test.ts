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

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function api(path: string, options: ApiOptions = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const body = options.body ? JSON.stringify(options.body) : undefined;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, body });
  const data = await res.json();
  return { status: res.status, data };
}

async function signup(username = "alice", email = "alice@test.com", password = "password123") {
  return api("/signup", {
    method: "POST",
    body: { username, email, password },
  });
}

async function login(email = "alice@test.com", password = "password123") {
  const { data } = await api("/login", {
    method: "POST",
    body: { email, password },
  });
  return data.token as string;
}

describe("Health check", () => {
  it("GET / retourne status ok", async () => {
    const { status, data } = await api("/");
    assert.strictEqual(status, 200);
    assert.strictEqual(data.status, "ok");
  });
});

describe("Signup", () => {
  it("crée un utilisateur", async () => {
    const { status, data } = await signup();
    assert.strictEqual(status, 201);
    assert.ok(data.userId);
  });

  it("refuse les champs manquants", async () => {
    const { status } = await api("/signup", {
      method: "POST",
      body: { username: "bob" },
    });
    assert.strictEqual(status, 400);
  });

  it("refuse les doublons", async () => {
    await signup();
    const { status } = await signup();
    assert.strictEqual(status, 409);
  });
});

describe("Login", () => {
  it("retourne un token avec des identifiants valides", async () => {
    await signup();
    const { status, data } = await api("/login", {
      method: "POST",
      body: { email: "alice@test.com", password: "password123" },
    });
    assert.strictEqual(status, 200);
    assert.ok(data.token);
    assert.strictEqual(data.user.username, "alice");
  });

  it("refuse les mauvais identifiants", async () => {
    await signup();
    const { status } = await api("/login", {
      method: "POST",
      body: { email: "alice@test.com", password: "wrong" },
    });
    assert.strictEqual(status, 401);
  });
});

describe("GET /users/:id", () => {
  it("retourne les infos publiques sans auth", async () => {
    await signup();
    const { status, data } = await api("/users/1");
    assert.strictEqual(status, 200);
    assert.strictEqual(data.username, "alice");
    assert.strictEqual(data.email, undefined);
  });

  it("retourne l'email si c'est son propre profil", async () => {
    await signup();
    const token = await login();
    const { status, data } = await api("/users/1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.email, "alice@test.com");
  });

  it("retourne 404 pour un utilisateur inexistant", async () => {
    const { status } = await api("/users/999");
    assert.strictEqual(status, 404);
  });
});

describe("PUT /users/:id", () => {
  it("refuse sans authentification", async () => {
    await signup();
    const { status } = await api("/users/1", {
      method: "PUT",
      body: { bio: "test" },
    });
    assert.strictEqual(status, 401);
  });

  it("refuse de modifier le profil d'un autre", async () => {
    await signup();
    await signup("bob", "bob@test.com");
    const bobToken = await login("bob@test.com");
    const { status } = await api("/users/1", {
      method: "PUT",
      headers: { Authorization: `Bearer ${bobToken}` },
      body: { bio: "hacked" },
    });
    assert.strictEqual(status, 403);
  });

  it("permet de modifier son propre profil", async () => {
    await signup();
    const token = await login();
    const { status } = await api("/users/1", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: { bio: "Hello world" },
    });
    assert.strictEqual(status, 200);

    const { data } = await api("/users/1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(data.bio, "Hello world");
  });
});

describe("DELETE /users/:id", () => {
  it("refuse sans authentification", async () => {
    await signup();
    const { status } = await api("/users/1", { method: "DELETE" });
    assert.strictEqual(status, 401);
  });

  it("refuse de supprimer le compte d'un autre", async () => {
    await signup();
    await signup("bob", "bob@test.com");
    const bobToken = await login("bob@test.com");
    const { status } = await api("/users/1", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    assert.strictEqual(status, 403);
  });

  it("permet de supprimer son propre compte", async () => {
    await signup();
    const token = await login();
    const { status } = await api("/users/1", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(status, 200);

    const { status: getStatus } = await api("/users/1");
    assert.strictEqual(getStatus, 404);
  });
});

describe("Token invalide", () => {
  it("rejette un token invalide sur n'importe quelle route", async () => {
    const { status } = await api("/", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    assert.strictEqual(status, 401);
  });
});
