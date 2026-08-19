'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useServiceBySlug } from '@/lib/api/hooks/useServices';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── ADD THIS LINE ──────────────────────────────────────────────────────
export const runtime = 'edge';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: service, isLoading } = useServiceBySlug(slug);

  if (isLoading) {
    return (
      <Container size="lg" className="py-16">
        <Skeleton className="h-96 w-full" />
      </Container>
    );
  }

  if (!service) {
    return (
      <Container size="lg" className="py-16 text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Service Not Found</h1>
        <p className="text-slate-400">The requested division could not be found.</p>
        <Link href="/services">
          <Button variant="primary">Back to Services</Button>
        </Link>
      </Container>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-[#123B5D]/40 to-transparent">
        <Container size="lg">
          <div className="space-y-4 max-w-3xl">
            <Link href="/services" className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center">
              ← Back to All Services
            </Link>
            <Badge variant="green">{service.division.toUpperCase()} DIVISION</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">{service.title}</h1>
            <p className="text-xl text-emerald-400 font-semibold">{service.tagline}</p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{service.description}</p>
          </div>
        </Container>
      </section>

      {/* Process & Capabilities */}
      <section>
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Features Card */}
              <Card variant="glass" className="space-y-4">
                <h3 className="text-xl font-bold text-white">Capabilities & Deliverables</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.features.map((feature) => (
                    <div key={feature} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#16A36A] mr-2.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Execution Process Steps */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Execution Lifecycle</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.process.map((p) => (
                    <Card key={p.step} variant="solid" className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">STEP 0{p.step}</span>
                      </div>
                      <h4 className="text-base font-bold text-white">{p.title}</h4>
                      <p className="text-xs text-slate-400">{p.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar CTA Card */}
            <div className="space-y-6">
              <Card variant="solid" className="p-6 space-y-4 border-[#16A36A]/50 sticky top-28">
                <h3 className="text-xl font-bold text-white">Inquire About This Service</h3>
                <p className="text-xs text-slate-300">
                  Ready to deploy {service.title} for your organization? Get in touch with our division lead.
                </p>
                <Link href={`/contact?service=${service.slug}`} className="block w-full">
                  <Button variant="accent" className="w-full">
                    Request Consultation
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
