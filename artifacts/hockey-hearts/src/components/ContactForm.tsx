import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

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
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className="bg-card border border-card-border rounded-3xl p-6 md:p-10 shadow-sm space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="email">Your Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          className="h-12 rounded-xl"
        />
      </div>

      <Button
        size="lg"
        type="submit"
        className="w-full h-14 text-lg rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Send Message
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We aim to respond within 2 business days.
      </p>
    </form>
  );
}
