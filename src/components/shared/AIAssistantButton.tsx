'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type AssistantConfig = { enabled: boolean; title: string; welcome: string; contactEmail: string };

const DEFAULT_CONFIG: AssistantConfig = {
  enabled: true,
  title: 'Growthbridge Assistant',
  welcome: 'Hello! Welcome to Growthbridge. How can we help your business or community grow?',
  contactEmail: 'hello@growthbridgevirtual.org',
};

export function AIAssistantButton() {
  const [config, setConfig] = useState<AssistantConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ sender: 'ai' | 'user'; text: string }>
  >([
    {
      sender: 'ai',
      text: 'Hello! I am Growthbridge Virtual AI Assistant. How can I help you learn about our digital solutions, talent hub, or community initiatives today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/public/site-config')
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!active || !payload?.data) return;
        const data = payload.data;
        setConfig({
          enabled: data.features?.enableAIAssistant ?? true,
          title: data.homepage?.chatTitle || DEFAULT_CONFIG.title,
          welcome: data.homepage?.chatWelcome || DEFAULT_CONFIG.welcome,
          contactEmail: data.homepage?.chatContactEmail || data.organization?.email || DEFAULT_CONFIG.contactEmail,
        });
        setMessages([{ sender: 'ai', text: data.homepage?.chatWelcome || DEFAULT_CONFIG.welcome }]);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setConfigLoaded(true); });
    return () => { active = false; };
  }, []);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim() || input.trim().length < 10 || submitting) return;
    const message = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: message }]);
    setInput('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: visitorName.trim(), email: visitorEmail.trim(), subject: 'Homepage assistant enquiry', message, type: 'general' }),
      });
      const result = await response.json();
      if (!response.ok || result?.success === false) throw new Error(result?.error || 'We could not send your enquiry. Please try again.');
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Thank you. Your enquiry has been sent to the Growthbridge team. We will follow up using the contact details you provided.' }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'ai', text: error instanceof Error ? error.message : 'We could not send your enquiry. Please try again.' }]);
      setInput(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (configLoaded && !config.enabled) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 p-3.5 sm:p-4 rounded-full bg-gradient-brand text-white shadow-2xl shadow-[var(--gb-green-600)]/40 hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer border border-white/20"
        aria-label={`Open ${config.title}`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-[var(--gb-green-400)]/45 animate-ping pointer-events-none"
        />
        <div className="relative z-10 flex items-center justify-center">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:rotate-12 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
      </button>

      {/* AI Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={config.title}
      >
        <div className="flex flex-col h-[min(70vh,400px)] min-h-[300px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-1 sm:p-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[var(--action-primary)] text-[var(--action-primary-text)] rounded-br-none'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Secure enquiry submission */}
          <form onSubmit={handleSend} className="pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input value={visitorName} onChange={(e) => setVisitorName(e.target.value)} placeholder="Your name" aria-label="Your name" required minLength={2} maxLength={100} className="py-2 text-xs min-w-0" />
              <Input type="email" value={visitorEmail} onChange={(e) => setVisitorEmail(e.target.value)} placeholder="Your email" aria-label="Your email" required maxLength={254} className="py-2 text-xs min-w-0" />
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="How can we help? (10+ characters)" aria-label="Your enquiry message" required minLength={10} maxLength={5000} className="py-2 text-xs flex-1 min-w-0" />
              <Button type="submit" size="sm" variant="primary" disabled={submitting || !visitorName.trim() || !visitorEmail.trim() || input.trim().length < 10} className="shrink-0 px-3 sm:px-4">{submitting ? 'Sending…' : 'Send'}</Button>
            </div>
            <p className="text-[10px] leading-relaxed text-[var(--text-tertiary)]">Your message is sent securely to our enquiries system. We use your details only to respond to this request.</p>
          </form>
        </div>
      </Modal>
    </>
  );
}
