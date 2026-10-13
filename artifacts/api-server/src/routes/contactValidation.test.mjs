import assert from "node:assert/strict";
import test from "node:test";
import { contactMessageSchema } from "./contactValidation.ts";

test("accepts valid contact details and trims surrounding whitespace", () => {
  const result = contactMessageSchema.safeParse({
    name: "  Jane Doe ",
    email: " jane@example.com ",
    message: "  I'd like to learn more.  ",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Jane Doe");
    assert.equal(result.data.email, "jane@example.com");
    assert.equal(result.data.message, "I'd like to learn more.");
  }
});

test("rejects missing, malformed, and overlong contact fields", () => {
  for (const body of [
    {},
    { name: "Jane", email: "invalid", message: "Hello" },
    { name: " ", email: "jane@example.com", message: "Hello" },
    { name: "Jane", email: "jane@example.com", message: " " },
    {
      name: "a".repeat(201),
      email: "jane@example.com",
      message: "Hello",
    },
    {
      name: "Jane",
      email: "jane@example.com",
      message: "a".repeat(10_001),
    },
  ]) {
    assert.equal(contactMessageSchema.safeParse(body).success, false);
  }
});
