'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { apiClient } from '@/lib/api/api-client';
import { publicConfig } from '@/lib/config/public';
import { GrowthbridgeVisual } from '@/components/brand/GrowthbridgeVisual';

export default function ContactPage() {
  const [tab, setTab] = useState<'general' | 'partnership'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [partnerData, setPartnerData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    partnershipType: 'collaborator' as const,
    message: '',
  });

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await apiClient.submitContact({
      ...formData,
      type: 'general',
    });

    setIsSubmitting(false);
    if (res.success) {
      setSuccessMessage(res.message || 'Thank you! We will get back to you shortly.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } else {
      setErrorMessage(res.message || 'We could not send your message. Please try again.');
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await apiClient.submitPartnership(partnerData);

    setIsSubmitting(false);
    if (res.success) {
      setSuccessMessage(res.message || 'Partnership inquiry received! We will be in touch.');
      setPartnerData({
        organizationName: '',
        contactPerson: '',
        email: '',
        phone: '',
        partnershipType: 'collaborator',
        message: '',
      });
    } else {
      setErrorMessage(res.message || 'We could not submit the partnership inquiry. Please try again.');
    }
  };

  return (
    <div className="public-page space-y-16 pb-20">
      {/* Hero */}
      <section className="public-page-hero py-12 sm:py-16 md:py-20">
        <Container size="lg">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="green" className="uppercase tracking-widest text-[10px]">
              Get in Touch
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Let&apos;s Build the <span className="text-gradient-gb">Bridge Together</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
              Have a digital project, partnership inquiry, or looking to join Growthbridge?
              We&apos;d love to hear from you.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section>
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              <GrowthbridgeVisual compact label="Growthbridge contact bridge visual" />
              <Card variant="glass" className="public-card p-4 sm:p-6 space-y-6 border-l-4 border-l-[var(--border-accent)]">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Organization Info
                </h3>

                <div className="space-y-4 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-start space-x-3">
                    <span aria-hidden="true" className="text-[var(--text-accent)]">•</span>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Location</p>
                      <p>Online & community-based operations</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span aria-hidden="true" className="text-[var(--text-accent)]">@</span>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Email</p>
                      <p>{publicConfig.NEXT_PUBLIC_CONTACT_EMAIL}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span aria-hidden="true" className="text-[var(--text-accent)]">+</span>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Phone</p>
                      <p>Contact by email</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="solid" className="p-6 space-y-3">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Operating Hours
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Monday — Friday: 08:00 - 17:00 SAST
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Virtual operations 24/7 for urgent client requests.
                </p>
              </Card>
            </div>

            {/* Forms Container */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setTab('general');
                    setSuccessMessage(null);
                  }}
                  className={`min-h-11 px-3 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    tab === 'general'
                      ? 'bg-[var(--action-primary)] text-[var(--action-primary-text)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  General Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('partnership');
                    setSuccessMessage(null);
                  }}
                  className={`min-h-11 px-3 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    tab === 'partnership'
                      ? 'bg-[var(--action-secondary)] text-[var(--action-secondary-text)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Partnership
                </button>
              </div>

              {errorMessage && (
                <div role="alert" className="p-4 rounded-xl bg-[var(--chip-danger-bg)] border border-[var(--chip-danger-text)]/30 text-[var(--chip-danger-text)] text-xs font-semibold">{errorMessage}</div>
              )}

              {successMessage && (
                <div className="p-4 rounded-xl bg-[var(--chip-success-bg)] border border-[var(--chip-success-text)]/30 text-[var(--chip-success-text)] text-xs font-semibold">
                  {successMessage}
                </div>
              )}

              {/* General Form */}
              {tab === 'general' && (
                <Card variant="glass" className="public-card p-4 sm:p-6 md:p-8">
                  <form onSubmit={handleGeneralSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name *"
                        placeholder="John Doe"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                      <Input
                        label="Email Address *"
                        type="email"
                        placeholder="john@company.com"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Phone Number"
                        placeholder="+27 82 123 4567"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                      <Input
                        label="Subject *"
                        placeholder="Project inquiry..."
                        required
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                      />
                    </div>

                    <Textarea
                      label="Message *"
                      placeholder="Tell us about your requirements or project vision..."
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </Card>
              )}

              {/* Partnership Form */}
              {tab === 'partnership' && (
                <Card variant="glass" className="public-card p-4 sm:p-6 md:p-8">
                  <form onSubmit={handlePartnerSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Organization Name *"
                        placeholder="Acme Corp"
                        required
                        value={partnerData.organizationName}
                        onChange={(e) =>
                          setPartnerData({
                            ...partnerData,
                            organizationName: e.target.value,
                          })
                        }
                      />
                      <Input
                        label="Contact Person *"
                        placeholder="Jane Smith"
                        required
                        value={partnerData.contactPerson}
                        onChange={(e) =>
                          setPartnerData({
                            ...partnerData,
                            contactPerson: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Email Address *"
                        type="email"
                        placeholder="jane@acme.com"
                        required
                        value={partnerData.email}
                        onChange={(e) =>
                          setPartnerData({ ...partnerData, email: e.target.value })
                        }
                      />
                      <Input
                        label="Phone Number *"
                        placeholder="+27 82 987 6543"
                        required
                        value={partnerData.phone}
                        onChange={(e) =>
                          setPartnerData({ ...partnerData, phone: e.target.value })
                        }
                      />
                    </div>

                    <Textarea
                      label="Partnership Vision *"
                      placeholder="Describe how you would like to collaborate with Growthbridge..."
                      required
                      value={partnerData.message}
                      onChange={(e) =>
                        setPartnerData({ ...partnerData, message: e.target.value })
                      }
                    />

                    <Button
                      type="submit"
                      variant="secondary"
                      size="lg"
                      fullWidth
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Partnership Request'}
                    </Button>
                  </form>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
