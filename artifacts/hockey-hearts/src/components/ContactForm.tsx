import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  return (
    <form className="bg-card border border-card-border rounded-3xl p-6 md:p-10 shadow-sm space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="First Name" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Last Name" className="h-12 rounded-xl" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="email@example.com" className="h-12 rounded-xl" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" placeholder="How can we help?" className="h-12 rounded-xl" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message" 
          placeholder="Write your message here..." 
          className="rounded-xl min-h-[150px]" 
        />
      </div>

      <Button size="lg" className="w-full h-14 text-lg rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
        Send Message
      </Button>
    </form>
  );
}
