import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export function DonationForm() {
  const [amount, setAmount] = useState<number | "custom">(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [cause, setCause] = useState("general");

  return (
    <form className="bg-card border border-card-border rounded-3xl p-6 md:p-10 shadow-xl space-y-8" onSubmit={(e) => e.preventDefault()}>
      
      {/* Amount Selection */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-primary">Choose Amount</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PRESET_AMOUNTS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={amount === preset ? "default" : "outline"}
              className={`h-14 text-lg font-semibold rounded-xl ${
                amount === preset 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-transparent text-primary border-primary/20 hover:border-primary"
              }`}
              onClick={() => {
                setAmount(preset);
                setCustomAmount("");
              }}
            >
              ${preset}
            </Button>
          ))}
          <div className="relative col-span-2 md:col-span-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
            <Input 
              type="number"
              placeholder="Other"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount("custom");
              }}
              className={`h-14 pl-8 text-lg font-semibold rounded-xl transition-colors ${
                amount === "custom" ? "border-primary ring-1 ring-primary" : "border-primary/20"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Cause Selection */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-primary">Designate Your Gift</h3>
        <RadioGroup value={cause} onValueChange={setCause} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: "general", label: "General Fund" },
            { id: "youth-hockey", label: "Youth Hockey Development" },
            { id: "community", label: "Community Hockey Programs" },
            { id: "equipment", label: "Equipment & Gear" },
            { id: "ice-time", label: "Ice Time & Training" },
            { id: "outreach", label: "Community Outreach" },
          ].map((c) => (
            <div key={c.id}>
              <RadioGroupItem value={c.id} id={c.id} className="peer sr-only" />
              <Label
                htmlFor={c.id}
                className="flex items-center justify-center p-4 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors font-medium text-primary"
              >
                {c.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Donor Information */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-primary">Your Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="Jane" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Doe" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="jane@example.com" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea 
              id="message" 
              placeholder="Leave a comment with your donation..." 
              className="rounded-xl min-h-[100px]" 
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-primary">Payment Method</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: "bank", label: "Bank Transfer", tag: "Recommended" },
            { id: "card", label: "Credit / Debit Card", tag: "" },
            { id: "crypto", label: "Cryptocurrency", tag: "" },
          ].map((m) => (
            <div key={m.id} className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-muted/30">
              <span className="font-medium text-primary">{m.label}</span>
              <span className="text-xs text-muted-foreground italic">
                {m.tag ? <span className="bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full font-semibold mr-2">{m.tag}</span> : null}
                Being configured
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground italic">
          Payment processing is currently being configured. Please contact us at{" "}
          <a href="mailto:contacthockeyheartinitiative@gmail.com" className="text-primary underline">
            contacthockeyheartinitiative@gmail.com
          </a>{" "}
          to complete your donation.
        </p>
      </div>

      <Button size="lg" className="w-full h-16 text-xl rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md">
        Donate ${amount === "custom" ? (customAmount || "0") : amount} Now
      </Button>

      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure payment processing
        </p>
        <p className="text-xs text-muted-foreground">
          Hockey Heart Initiative is a 501(c)(3) tax-exempt organization.
        </p>
      </div>
    </form>
  );
}
