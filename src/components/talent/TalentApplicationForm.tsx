'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/providers/ToastProvider';
import { apiClient } from '@/lib/api/api-client';

export function TalentApplicationForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { success } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Full-Stack Developer',
    skills: [] as string[],
    portfolio: '',
    linkedin: '',
    motivation: '',
  });

  const availableSkills = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'UI/UX Design',
    'Figma', 'Mobile Apps', 'DevOps', 'Data Science', 'Digital Marketing', 'Business Analysis',
  ];

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await apiClient.submitApplication(formData);

    setIsSubmitting(false);
    if (res.success) {
      setSubmitted(true);
      success('Application Submitted!', 'Thank you for applying to Growthbridge. We will review your profile.');
    }
  };

  if (submitted) {
    return (
      <Card variant="glass" className="p-5 sm:p-8 text-center space-y-4 border-l-4 border-l-[var(--border-accent)]">
        <div className="w-16 h-16 rounded-full bg-[var(--chip-success-bg)] text-[var(--chip-success-text)] flex items-center justify-center text-3xl mx-auto">
          🎉
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Application Received!</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Welcome to the Growthbridge applicant pipeline. Our Talent Operations team reviews applications weekly and will get back to you via email.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Step Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="min-w-0">
          <Badge variant="green" className="text-[10px] mb-1">
            STEP {step} OF 3
          </Badge>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Skills & Capabilities Matrix'}
            {step === 3 && 'Portfolio & Motivation'}
          </h3>
        </div>
        <div className="flex space-x-1 flex-shrink-0" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                step >= i ? 'bg-[var(--action-primary)] w-8' : 'bg-[var(--surface-muted)] w-6'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="Sipho Khumalo"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="sipho@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              placeholder="+27 83 123 4567"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Primary Target Role *"
              placeholder="e.g. Frontend Engineer, Designer"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <Button onClick={() => setStep(2)} variant="primary" size="lg" fullWidth className="mt-2">
            Next: Select Skills →
          </Button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Select the skills that best describe your current strengths. Choose at least one.
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map((skill) => {
              const active = formData.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`min-h-10 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--chip-green-bg)] text-[var(--chip-green-text)] border-[var(--gb-green-600)]/40'
                      : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            {formData.skills.length} skill{formData.skills.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button onClick={() => setStep(1)} variant="outline" size="lg" fullWidth className="sm:w-auto">
              ← Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              variant="primary"
              size="lg"
              fullWidth
              className="sm:flex-1"
              disabled={formData.skills.length === 0}
            >
              Next: Portfolio →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <form onSubmit={handleComplete} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Portfolio / GitHub URL"
              placeholder="https://github.com/you"
              value={formData.portfolio}
              onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
            />
            <Input
              label="LinkedIn Profile"
              placeholder="https://linkedin.com/in/you"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            />
          </div>
          <Textarea
            label="Motivation *"
            placeholder="Why do you want to join Growthbridge?"
            required
            value={formData.motivation}
            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
          />
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button type="button" onClick={() => setStep(2)} variant="outline" size="lg" fullWidth className="sm:w-auto">
              ← Back
            </Button>
            <Button type="submit" variant="accent" size="lg" fullWidth className="sm:flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
