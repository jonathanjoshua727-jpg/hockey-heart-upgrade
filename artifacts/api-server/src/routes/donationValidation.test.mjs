import assert from "node:assert/strict";
import test from "node:test";
import {
  getInitializeValidationMessage,
  initializeSchema,
} from "./donationValidation.ts";

const validDonation = {
  amount: 50,
  causeId: "general",
  causeLabel: "Where Needed Most",
  donorName: "Jane Doe",
  email: "jane.doe@example.com",
  anonymous: false,
  method: "card",
  redirectPath: "/donate",
};

test("accepts a named donor request and defaults the server currency to USD", () => {
  const result = initializeSchema.safeParse(validDonation);

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.currency, "USD");
    assert.equal(result.data.donorName, "Jane Doe");
    assert.equal(result.data.email, "jane.doe@example.com");
  }
});

test("accepts an explicit USD currency and trims donor name and email", () => {
  const result = initializeSchema.safeParse({
    ...validDonation,
    currency: "USD",
    donorName: "  Jane Doe  ",
    email: "  jane.doe@example.com  ",
  });

  test("preserves the $50 USD minimum", () => {
    const belowMinimum = initializeSchema.safeParse({
      ...validDonation,
      amount: 49.99,
    });
    const atMinimum = initializeSchema.safeParse(validDonation);

    assert.equal(belowMinimum.success, false);
    if (!belowMinimum.success) {
      assert.equal(
        getInitializeValidationMessage(belowMinimum.error),
        "Minimum donation is $50 USD.",
      );
    }
    assert.equal(atMinimum.success, true);
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.donorName, "Jane Doe");
    assert.equal(result.data.email, "jane.doe@example.com");
  }
});

test("rejects unsupported currencies and invalid payment methods", () => {
  const currency = initializeSchema.safeParse({
    ...validDonation,
    currency: "CAD",
  });
  const method = initializeSchema.safeParse({
    ...validDonation,
    method: "crypto",
  });

  assert.equal(currency.success, false);
  if (!currency.success) {
    assert.equal(
      getInitializeValidationMessage(currency.error),
      "Donations can only be processed in USD.",
    );
  }
  assert.equal(method.success, false);
  if (!method.success) {
    assert.equal(
      getInitializeValidationMessage(method.error),
      "Please select a valid payment method.",
    );
  }
});

test("returns clear validation errors for a missing name or invalid email", () => {
  const missingName = initializeSchema.safeParse({
    ...validDonation,
    donorName: " ",
  });
  const invalidEmail = initializeSchema.safeParse({
    ...validDonation,
    email: "not-an-email",
  });

  assert.equal(missingName.success, false);
  if (!missingName.success) {
    assert.equal(
      getInitializeValidationMessage(missingName.error),
      "Please enter your first name.",
    );
  }
  assert.equal(invalidEmail.success, false);
  if (!invalidEmail.success) {
    assert.equal(
      getInitializeValidationMessage(invalidEmail.error),
      "Please enter a valid email address.",
    );
  }
});
