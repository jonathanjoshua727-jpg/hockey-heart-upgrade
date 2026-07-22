import { Shell } from "@/components/layout/Shell";
import { ContactForm } from "@/components/ContactForm";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <Shell>
      <section className="bg-primary py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-primary-foreground/80">
            Have a question about our programs, want to volunteer, or interested in partnering? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info & Map */}
            <div className="space-y-12">
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-8">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Headquarters</h4>
                      <p className="text-muted-foreground mt-1">
                        123 Ice Rink Way, Suite 400<br />
                        Minneapolis, MN 55401
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Phone</h4>
                      <p className="text-muted-foreground mt-1">
                        (555) 123-4567<br />
                        Mon-Fri, 9am - 5pm CST
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Email</h4>
                      <p className="text-muted-foreground mt-1">
                        hello@hockeyhearts.org<br />
                        grants@hockeyhearts.org
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div>
                <div className="w-full h-[300px] bg-muted rounded-3xl overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground">
                    <MapPin className="w-10 h-10 mb-2 opacity-50" />
                    <span>Interactive Map Placeholder</span>
                  </div>
                  {/* Real map would go here via iframe or library */}
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-primary mb-8">Send a Message</h2>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>
    </Shell>
  );
}
