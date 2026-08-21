import { Shell } from "@/components/layout/Shell";

export default function Terms() {
  return (
    <Shell>
      <section className="bg-primary py-16 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Terms of Use</h1>
          <p className="text-primary-foreground/70 text-sm">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="space-y-10 text-foreground">

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Hockey Heart Initiative website ("Site"), you agree to be bound by
                these Terms of Use. If you do not agree to these terms, please do not use this Site.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">2. Use of the Site</h2>
              <p className="text-muted-foreground leading-relaxed">You agree to use this Site only for lawful purposes and in a manner that does not:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Infringe on the rights of others</li>
                <li>Transmit any harmful, offensive, or disruptive content</li>
                <li>Attempt to gain unauthorized access to any part of the Site</li>
                <li>Interfere with the proper functioning of the Site</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">3. Donations</h2>
              <p className="text-muted-foreground leading-relaxed">
                All donations made through this Site are voluntary and non-refundable unless Hockey Heart
                Initiative determines, in its sole discretion, that a refund is warranted. Donations are
                tax-deductible to the extent permitted by law. We are a 501(c)(3) nonprofit organization.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">4. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this Site — including text, images, logos, and design — is the property of
                Hockey Heart Initiative and may not be reproduced, distributed, or used without prior written
                permission, except for personal, non-commercial purposes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">5. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                This Site may contain links to third-party websites. Hockey Heart Initiative is not responsible
                for the content, privacy practices, or terms of those sites. Links do not imply endorsement.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">6. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                This Site is provided "as is" without any warranties of any kind, either express or implied.
                Hockey Heart Initiative makes no representations about the accuracy, completeness, or suitability
                of the information on this Site for any purpose.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Hockey Heart Initiative shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages arising from your use of
                this Site or any donations made through it.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">8. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Use at any time. Changes become effective
                immediately upon posting to the Site. Continued use of the Site after changes constitutes
                your acceptance of the new terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">9. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Use are governed by the laws of the United States and the state in which
                Hockey Heart Initiative is incorporated, without regard to conflict of law principles.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary">10. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these terms, contact:{" "}
                <a href="mailto:contact@hockeyheartinitiative.com" className="text-primary underline">
                  contact@hockeyheartinitiative.com
                </a>
              </p>
            </div>

          </div>
        </div>
      </section>
    </Shell>
  );
}
