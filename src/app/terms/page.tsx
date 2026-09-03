import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Terms of Service | Growthbridge',
  description: 'Terms governing use of the Growthbridge Virtual Organization website and services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 sm:py-20">
      <Container size="md">
        <article className="prose prose-slate max-w-none dark:prose-invert">
          <p className="text-sm font-semibold text-[var(--text-accent)]">GROWTHBRIDGE</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">Terms of Service</h1>
          <p className="text-sm text-[var(--text-secondary)]">Last updated: September 2, 2026</p>

          <h2>1. Use of this website</h2>
          <p>Use the website lawfully and do not attempt to disrupt, abuse, scrape protected systems, bypass access controls, or interfere with other users.</p>

          <h2>2. Services and enquiries</h2>
          <p>Information about services, projects, talent opportunities, and programmes is provided for general informational purposes. Submitting an enquiry or application does not create a contract or guarantee acceptance.</p>

          <h2>3. Applications and submitted information</h2>
          <p>You are responsible for providing accurate information and for having permission to submit information about another person or organization. Do not submit passwords, payment credentials, or other secrets through public forms.</p>

          <h2>4. Intellectual property</h2>
          <p>Unless otherwise stated, Growthbridge branding, original content, and site materials belong to Growthbridge or their respective licensors. Third-party names and marks remain the property of their owners.</p>

          <h2>5. Availability</h2>
          <p>We aim to keep the platform reliable but do not guarantee uninterrupted availability. Features that depend on external providers may be temporarily unavailable without affecting core site access.</p>

          <h2>6. Privacy</h2>
          <p>Our handling of personal information is described in the <a href="/privacy">Privacy Policy</a>.</p>

          <h2>7. Changes</h2>
          <p>We may update these terms as the platform evolves. Material changes will be reflected on this page with an updated date.</p>

          <h2>8. Contact</h2>
          <p>For questions about these terms, use our <a href="/contact">contact page</a>.</p>
        </article>
      </Container>
    </div>
  );
}
