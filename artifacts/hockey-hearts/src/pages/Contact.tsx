import { Shell } from "@/components/layout/Shell";
import { ContactForm } from "@/components/ContactForm";
import { Mail, MapPin, Phone, MessageCircle, Globe } from "lucide-react";
import { getContactInfo } from "@/lib/contentStore";
import { trackClick } from "@/lib/analytics";

export default function Contact() {
  const info = getContactInfo();

  const hasAddress = !!(info.physicalAddress || info.address);
  const addressText = info.physicalAddress
    ? [info.physicalAddress, info.city, info.state, info.country].filter(Boolean).join(', ')
    : info.address !== ''
    ? info.address
    : null;

  return (
    <Shell>
      <section className="bg-primary py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-primary-foreground/80">
            {info.contactMessage || "Have a question about our programs, want to volunteer, or interested in partnering? We'd love to hear from you."}
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Contact Info */}
            <div className="space-y-10">
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-8">Contact Information</h2>
                <div className="space-y-6">

                  {/* Primary email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Email</h4>
                      <a
                        href={`mailto:${info.email}`}
                        onClick={() => trackClick('Contact Email', 'email', info.email, '/contact')}
                        className="text-primary underline mt-1 block"
                      >
                        {info.email}
                      </a>
                      {info.secondaryEmail && (
                        <a
                          href={`mailto:${info.secondaryEmail}`}
                          onClick={() => trackClick('Secondary Email', 'email', info.secondaryEmail!, '/contact')}
                          className="text-muted-foreground underline mt-0.5 block text-sm"
                        >
                          {info.secondaryEmail}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  {info.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">Phone</h4>
                        <a
                          href={`tel:${info.phone}`}
                          onClick={() => trackClick('Phone', 'phone', info.phone, '/contact')}
                          className="text-muted-foreground mt-1 block hover:text-primary transition-colors"
                        >
                          {info.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {info.whatsapp && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">WhatsApp</h4>
                        <a
                          href={`https://wa.me/${info.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackClick('WhatsApp', 'whatsapp', info.whatsapp!, '/contact')}
                          className="text-muted-foreground mt-1 block hover:text-primary transition-colors"
                        >
                          {info.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {info.website && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">Website</h4>
                        <a
                          href={info.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground mt-1 block hover:text-primary transition-colors"
                        >
                          {info.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Address (only if set) */}
                  {hasAddress && addressText && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">Mailing Address</h4>
                        <p className="text-muted-foreground mt-1">{addressText}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info box */}
              <div className="bg-muted/40 border border-border rounded-2xl p-8 space-y-3">
                <h3 className="font-serif text-xl font-bold text-primary">Before You Write</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex gap-2"><span className="text-secondary font-bold">→</span> For donation inquiries, include your preferred amount and cause.</li>
                  <li className="flex gap-2"><span className="text-secondary font-bold">→</span> For grant applications, include the child's age and program details.</li>
                  <li className="flex gap-2"><span className="text-secondary font-bold">→</span> For partnership requests, include your organization's name and mission.</li>
                  <li className="flex gap-2"><span className="text-secondary font-bold">→</span> For media or press inquiries, mention your publication and deadline.</li>
                </ul>
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
