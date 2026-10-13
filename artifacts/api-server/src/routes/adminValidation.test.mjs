import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import { test } from "node:test";
import {
  adminLoginSchema,
  parseAdminLoginBody,
} from "./adminValidation.ts";

async function withLoginTestServer(run) {
  const app = express();
  app.use(express.json());
  app.post("/admin/login", ...parseAdminLoginBody, (req, res) => {
    const parsed = adminLoginSchema.safeParse(req.body);
    res.status(parsed.success ? 200 : 400).json(
      parsed.success ? { ok: true } : { error: "Invalid login payload." },
    );
  });

  const server = app.listen(0);
  await once(server, "listening");

  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    await run(`http://127.0.0.1:${address.port}/admin/login`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("accepts JSON login fields even when the content type is text/plain", async () => {
  await withLoginTestServer(async (url) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ username: "admin", password: "password" }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });
});

test("rejects malformed text login bodies with HTTP 400", async () => {
  await withLoginTestServer(async (url) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "not-json",
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: "Invalid login payload: expected a JSON object.",
    });
  });
});
