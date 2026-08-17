import { Shell } from "@/components/layout/Shell";

export default function Privacy() {
  return (
    <Shell>
      <section className="bg-primary py-16 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-primary-foreground/70 text-sm">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl prose prose-slate max-w-none">
          <div className="space-y-10 text-foreground">

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Hockey Heart Initiative ("we," "us," or "our") is committed to protecting your personal information
                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you visit our website or make a donation to our organization.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">We may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Contact information:</strong> Name, email address, and mailing address when you contact us or donate.</li>
                <li><strong>Donation information:</strong> Donation amount, designated cause, and payment confirmation references. We do not store card numbers or banking credentials.</li>
                <li><strong>Usage data:</strong> Pages visited, time spent on the site, and browser information collected via standard web analytics tools.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To process and acknowledge donations</li>
                <li>To send program updates and impact reports (only with your consent)</li>
                <li>To respond to your inquiries</li>
                <li>To improve our website and communications</li>
                <li>To comply with legal obligations as a 501(c)(3) nonprofit</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">4. We Do Not Sell Your Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                Hockey Heart Initiative does not sell, trade, or rent your personal information to third parties.
                We do not share your information with advertisers or commercial entities for marketing purposes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your information. Payment processing
                is handled by certified third-party processors. We do not store card details, bank account
                numbers, or cryptocurrency private keys on our systems.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to request access to, correction of, or deletion of your personal data.
                To make a request, contact us at{" "}
                <a href="mailto:hockeyheartinitiative@gmail.com" className="text-primary underline">
                  hockeyheartinitiative@gmail.com
                </a>.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">7. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may use cookies to improve your browsing experience. You can control cookie settings
                through your browser preferences. Disabling cookies will not affect your ability to use the
                primary functions of our website.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">8. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify users of any material
                changes by updating the "Last updated" date at the top of this page.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">9. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related questions, contact us at:{" "}
                <a href="mailto:hockeyheartinitiative@gmail.com" className="text-primary underline">
                  hockeyheartinitiative@gmail.com
                </a>
              </p>
            </div>

          </div>
        </div>
      </section>
    </Shell>
  );
}
