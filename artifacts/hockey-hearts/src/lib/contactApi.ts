export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<void> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name.trim(),
      email: input.email.trim(),
      message: input.message.trim(),
    }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(
      body.error ?? `Unable to send your message (HTTP ${response.status}).`,
    );
  }
}
