import { Link } from "wouter";
import { CircleDot, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
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
                Hockey Heart Initiative
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-sm">
              Empowering youth through hockey and championing children's health initiatives. We believe every child deserves the chance to play, heal, and thrive.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="mailto:contacthockeyheartinitiative@gmail.com" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
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
            © {new Date().getFullYear()} Hockey Heart Initiative. A 501(c)(3) nonprofit organization.
          </p>
          <div className="flex gap-6">
            <button className="text-primary-foreground/50 hover:text-white text-sm transition-colors">Privacy Policy</button>
            <button className="text-primary-foreground/50 hover:text-white text-sm transition-colors">Terms of Use</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
