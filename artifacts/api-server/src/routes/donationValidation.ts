import { z } from "zod/v4";

export const initializeSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  currency: z.literal("USD").default("USD"),
  causeId: z.string().trim().min(1).max(100),
  causeLabel: z.string().trim().min(1).max(200),
  donorName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  anonymous: z.boolean().default(false),
  message: z.string().max(2000).optional(),
  method: z.enum(["card", "bank_transfer"]),
  redirectPath: z
    .string()
    .max(300)
    .regex(/^\/(?!\/)/)
    .optional(),
});

export function getInitializeValidationMessage(error: z.ZodError): string {
  const field = String(error.issues[0]?.path[0] ?? "");
  const messages: Record<string, string> = {
    amount: "Please enter a valid donation amount.",
    currency: "Donations can only be processed in USD.",
    causeId: "Please select a valid donation program.",
    causeLabel: "Please select a valid donation program.",
    donorName: "Please enter your first name.",
    email: "Please enter a valid email address.",
    message: "Your message must be 2,000 characters or fewer.",
    method: "Please select a valid payment method.",
    redirectPath: "The donation return path is invalid.",
  };

  return messages[field] ?? "Invalid donation details.";
}
