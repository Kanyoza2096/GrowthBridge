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
      <Card variant="glass" className="p-8 text-center space-y-4 border-l-4 border-l-[var(--border-accent)]">
        <div className="w-16 h-16 rounded-full bg-[var(--chip-success-bg)] text-[var(--chip-success-text)] flex items-center justify-center text-3xl mx-auto">
          🎉
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)]">Application Received!</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Welcome to the Growthbridge applicant pipeline. Our Talent Operations team reviews applications weekly and will get back to you via email.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-8 space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
        <div>
          <Badge variant="green" className="text-[10px] mb-1">
            STEP {step} OF 3
          </Badge>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Skills & Capabilities Matrix'}
            {step === 3 && 'Portfolio & Motivation'}
          </h3>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-8 h-2 rounded-full transition-all ${
                step >= i ? 'bg-[var(--action-primary)]' : 'bg-[var(--surface-muted)]'
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

          <Button onClick={() => setStep(2)} variant="primary" size="lg" className="w-full mt-4">
            Next: Select Skills →
          </Button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Select Your Key Technical & Professional Skills
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            {availableSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  formData.skills.includes(skill)
                    ? 'bg-[var(--action-primary)] border-[var(--action-primary)] text-[var(--action-primary-text)]'
                    : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {skill} {formData.skills.includes(skill) ? '✓' : '+'}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-6">
            <Button onClick={() => setStep(1)} variant="outline" size="lg" className="w-1/3">
              ← Back
            </Button>
            <Button onClick={() => setStep(3)} variant="primary" size="lg" className="w-2/3">
              Next: Motivation →
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
              placeholder="https://github.com/username"
              value={formData.portfolio}
              onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
            />
            <Input
              label="LinkedIn Profile"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            />
          </div>

          <Textarea
            label="Why do you want to join Growthbridge? *"
            placeholder="Tell us about your background, passion for tech, and career goals..."
            required
            value={formData.motivation}
            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={() => setStep(2)} variant="outline" size="lg" className="w-1/3">
              ← Back
            </Button>
            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="w-2/3">
              {isSubmitting ? 'Submitting...' : 'Submit Application 🚀'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
