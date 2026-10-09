import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import {
  issueAdminToken,
  requireAdmin,
  verifyAdminToken,
} from "../lib/adminToken.ts";

process.env.SESSION_SECRET = "unit-test-session-secret";

function signPayload(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(encoded)
    .digest("hex");
  return `${encoded}.${signature}`;
}

function responseRecorder() {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return response;
}

test("issues and verifies an expiring admin token", () => {
  const issued = issueAdminToken("administrator");

  assert.equal(typeof issued.token, "string");
  assert.ok(issued.expiresAt > Date.now());
  assert.deepEqual(verifyAdminToken(issued.token), {
    username: "administrator",
  });
});

test("rejects malformed, modified, and expired admin tokens", () => {
  const issued = issueAdminToken("administrator");
  const [payload, signature] = issued.token.split(".");

  assert.equal(verifyAdminToken("not-a-token"), null);
  assert.equal(
    verifyAdminToken(`${payload}.${signature.slice(1)}`),
    null,
  );
  assert.equal(
    verifyAdminToken(signPayload({ u: "administrator", exp: Date.now() - 1 })),
    null,
  );
});

test("protects admin routes from missing and invalid bearer tokens", () => {
  for (const authorization of [undefined, "Bearer invalid"]) {
    const response = responseRecorder();
    let continued = false;

    requireAdmin(
      { headers: { authorization } },
      response,
      () => {
        continued = true;
      },
    );

    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.body, { error: "Unauthorized" });
    assert.equal(continued, false);
  }
});

test("accepts a valid bearer token for a protected route", () => {
  const response = responseRecorder();
  let continued = false;

  requireAdmin(
    {
      headers: {
        authorization: `Bearer ${issueAdminToken("administrator").token}`,
      },
    },
    response,
    () => {
      continued = true;
    },
  );

  assert.equal(continued, true);
});
