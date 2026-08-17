import { Link } from "wouter";
import { CircleDot, Mail, Phone, MessageCircle, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getContactInfo, getSiteSettings } from "@/lib/contentStore";
import { trackClick } from "@/lib/analytics";

export function Footer() {
  const contact = getContactInfo();
  const settings = getSiteSettings();

  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary-border py-12 md:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-secondary text-secondary-foreground p-1.5 rounded-full">
                <CircleDot className="h-6 w-6" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-white">
                {settings.siteName}
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-sm">
              {settings.footerTagline}
            </p>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <a
                href={`mailto:${contact.email}`}
                onClick={() => trackClick('Footer Email', 'email', contact.email, 'footer')}
                className="text-primary-foreground/70 hover:text-secondary transition-colors"
                title={contact.email}
              >
                <Mail className="h-5 w-5" />
              </a>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} onClick={() => trackClick('Footer Phone', 'phone', contact.phone, 'footer')} className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  <Phone className="h-4 w-4" />
                </a>
              )}
              {contact.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('Footer WhatsApp', 'whatsapp', contact.whatsapp!, 'footer')} className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {contact.socialLinks.facebook && <a href={contact.socialLinks.facebook} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('Footer Facebook', 'external', contact.socialLinks.facebook, 'footer')} className="text-primary-foreground/70 hover:text-secondary transition-colors"><Facebook className="h-4 w-4" /></a>}
              {contact.socialLinks.twitter && <a href={contact.socialLinks.twitter} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('Footer Twitter', 'external', contact.socialLinks.twitter, 'footer')} className="text-primary-foreground/70 hover:text-secondary transition-colors"><Twitter className="h-4 w-4" /></a>}
              {contact.socialLinks.instagram && <a href={contact.socialLinks.instagram} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('Footer Instagram', 'external', contact.socialLinks.instagram, 'footer')} className="text-primary-foreground/70 hover:text-secondary transition-colors"><Instagram className="h-4 w-4" /></a>}
              {contact.socialLinks.linkedin && <a href={contact.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('Footer LinkedIn', 'external', contact.socialLinks.linkedin, 'footer')} className="text-primary-foreground/70 hover:text-secondary transition-colors"><Linkedin className="h-4 w-4" /></a>}
              {contact.socialLinks.youtube && <a href={contact.socialLinks.youtube} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('Footer YouTube', 'external', contact.socialLinks.youtube, 'footer')} className="text-primary-foreground/70 hover:text-secondary transition-colors"><Youtube className="h-4 w-4" /></a>}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Our Story</Link>
              </li>
              <li>
                <Link href="/mission" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Our Mission</Link>
              </li>
              <li>
                <Link href="/vision" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Our Vision</Link>
              </li>
              <li>
                <Link href="/campaigns" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Current Campaigns</Link>
              </li>
              <li>
                <Link href="/impact" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Impact & Reports</Link>
              </li>
              <li>
                <Link href="/news" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">News & Updates</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Get Involved</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/donate" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Make a Donation</Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Volunteer</Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Partner With Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">FAQ</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-white">Stay Updated</h4>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Subscribe to our newsletter for updates on campaigns and impact stories.
            </p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder="Email address" 
                className="bg-primary-foreground/10 border-primary-foreground/20 text-white placeholder:text-primary-foreground/50 focus-visible:ring-secondary"
              />
              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Subscribe
              </Button>
            </form>
          </div>

        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-primary-foreground/50 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-primary-foreground/50 hover:text-white text-sm transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
