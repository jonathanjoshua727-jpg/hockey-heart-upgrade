import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/contactApi";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitContactMessage({ name, email, message });
      setSubmitted(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't send your message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-card border border-card-border rounded-3xl p-10 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-bold text-primary">Message Received</h3>
        <p className="text-muted-foreground">
          Thank you for reaching out. We'll get back to you at the email address you provided.
        </p>
        <button
          className="text-primary underline text-sm"
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setMessage("");
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className="bg-card border border-card-border rounded-3xl p-6 md:p-10 shadow-sm space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="contact-name">Your Name</Label>
        <Input
          id="contact-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          maxLength={200}
          required
          className="h-12 rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">Your Email Address</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          maxLength={320}
          placeholder="you@example.com"
          required
          className="h-12 rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Your Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={10_000}
          required
          rows={6}
          className="rounded-xl"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        size="lg"
        type="submit"
        disabled={loading}
        className="w-full h-14 text-lg rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading ? "Sending…" : "Send Message"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We aim to respond within 2 business days.
      </p>
    </form>
  );
}
