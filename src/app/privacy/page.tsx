import React from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Privacy Policy | Growthbridge Virtual Organization',
  description:
    'How Growthbridge Virtual Organization collects, uses, and protects your personal information across our website, services, and programs.',
  robots: {
    index: true,
    follow: true,
  },
};

const sections = [
  {
    title: '1. Introduction',
    content:
      'Growthbridge Virtual Organization ("Growthbridge," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website growthbridge.org, use our services, or interact with our programs. By accessing or using our services, you consent to the practices described in this policy.',
  },
  {
    title: '2. Information We Collect',
    content:
      'We collect information you provide directly, such as when you submit a contact form, apply for a program, register for an event, or communicate with us. This may include your name, email address, phone number, organization, country, and any other information you choose to share. We also collect certain information automatically, including IP address, browser type, device information, pages visited, and time spent on pages.',
  },
  {
    title: '3. How We Use Your Information',
    content:
      'We use the information we collect to: respond to your inquiries; process applications for our programs; provide and improve our services; send you newsletters, updates, and event invitations; analyze website performance and usage trends; comply with legal obligations; and protect our rights and interests.',
  },
  {
    title: '4. Data Sharing and Disclosure',
    content:
      'We do not sell, rent, or trade your personal information. We may share your information with trusted service providers who assist us in operating our website and programs, such as hosting providers, email services, and analytics tools. These providers are bound by confidentiality agreements and may only use your data to provide services to us. We may also disclose information where required by law or to protect our rights.',
  },
  {
    title: '5. Data Security',
    content:
      'We implement reasonable technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal data, we cannot guarantee absolute security.',
  },
  {
    title: '6. Data Retention',
    content:
      'We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. When your data is no longer needed, we securely delete or anonymize it.',
  },
  {
    title: '7. Your Rights',
    content:
      'Depending on your location, you may have the right to: access your personal data; correct inaccurate information; request deletion of your data; object to or restrict processing; data portability; and withdraw consent at any time. To exercise these rights, contact us at hello@growthbridge.org.',
  },
  {
    title: '8. Cookies and Tracking',
    content:
      'We use cookies and similar technologies to enhance your experience, analyze site traffic, and understand user behavior. You can control cookies through your browser settings. Essential cookies are required for basic site functionality, while analytics cookies help us improve our services.',
  },
  {
    title: '9. Third-Party Links',
    content:
      'Our website may contain links to third-party websites, services, or resources. We are not responsible for the privacy practices or content of these third parties. We encourage you to review the privacy policies of any third-party services you visit.',
  },
  {
    title: '10. Children\'s Privacy',
    content:
      'Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.',
  },
  {
    title: '11. International Data Transfers',
    content:
      'Growthbridge operates across multiple countries. Your information may be transferred to and processed in countries other than your own, where data protection laws may differ. We take appropriate safeguards to ensure your information remains protected.',
  },
  {
    title: '12. Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the new policy.',
  },
  {
    title: '13. Contact Us',
    content:
      'If you have questions or concerns about this Privacy Policy or our data practices, please contact us at hello@growthbridge.org or through our contact page. We will respond to inquiries within a reasonable timeframe.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-page)] py-24">
      <Container size="md">
        <div className="space-y-12">
          <div className="public-card p-5 sm:p-6 border-l-4 border-l-[var(--gb-green-600)]">
            <span className="public-kicker">Trust & transparency</span>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">A clear explanation of what we collect, why we collect it, and the choices available to you.</p>
          </div>
          {/* Header */}
          <div className="space-y-4">
            <Badge variant="green" className="text-[10px] uppercase tracking-widest">
              Legal
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Privacy Policy
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Last Updated: August 13, 2026
            </p>
          </div>

          {/* Intro */}
          <div className="p-6 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border-subtle)]">
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              This Privacy Policy describes how Growthbridge Virtual Organization collects,
              uses, and protects your personal information. We value your trust and are
              committed to being transparent about our data practices.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {section.title}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="pt-8 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-tertiary)]">
              Questions? Reach out at{' '}
              <a
                href="mailto:hello@growthbridge.org"
                className="text-[var(--text-accent)] hover:underline"
              >
                hello@growthbridge.org
              </a>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
