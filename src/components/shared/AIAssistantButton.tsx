'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type ChatMessage = { sender: 'ai' | 'user'; text: string };

const welcomeMessage: ChatMessage = {
  sender: 'ai',
  text: 'Welcome to GrowthBridge. I can help you explore our services, understand what may fit your goals, and work out a practical next step. What are you trying to achieve?',
};

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [leadStatus, setLeadStatus] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userText = input.trim();
    if (!userText || isSending) return;

    const nextMessages = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/growthbridge-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-8).map((message) => ({
            role: message.sender === 'ai' ? 'assistant' : 'user',
            content: message.text,
          })),
        }),
      });
      const result = await response.json() as { reply?: string; error?: string };
      if (!response.ok || !result.reply) {
        throw new Error(result.error || 'The consultant is temporarily unavailable. Please try again.');
      }
      setMessages((current) => [...current, { sender: 'ai', text: result.reply || '' }]);
    } catch (error) {
      setMessages((current) => [...current, {
        sender: 'ai',
        text: error instanceof Error ? error.message : 'I could not respond just now. Please try again or use our Contact page.',
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consent || isSubmittingLead) return;
    setIsSubmittingLead(true);
    setLeadStatus('');

    const transcript = messages
      .slice(-8)
      .map((message) => (message.sender === 'user' ? 'Visitor' : 'GrowthBridge AI') + ': ' + message.text)
      .join('\n\n');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          phone: leadPhone.trim() || undefined,
          subject: 'GrowthBridge AI consultation request',
          message: 'The visitor asked to be connected with the GrowthBridge team. Recent conversation (shared with consent):\n\n' + transcript,
          type: 'general',
        }),
      });
      const result = await response.json() as { success?: boolean; error?: string; message?: string };
      if (!response.ok || !result.success) throw new Error(result.error || 'We could not send your enquiry. Please try again.');
      setLeadStatus('Thank you. Your enquiry has been sent to the GrowthBridge team.');
      setShowLeadForm(false);
      setConsent(false);
    } catch (error) {
      setLeadStatus(error instanceof Error ? error.message : 'We could not send your enquiry. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 p-3.5 sm:p-4 rounded-full bg-gradient-brand text-white shadow-2xl shadow-[var(--gb-green-600)]/40 hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer border border-white/20"
        aria-label="Open GrowthBridge AI consultant"
        aria-haspopup="dialog"
      >
        <span aria-hidden="true" className="absolute inset-0 rounded-full border border-[var(--gb-green-400)]/45 animate-ping pointer-events-none" />
        <span className="relative z-10 flex items-center justify-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="GrowthBridge AI — Business Growth Consultant">
        <div className="flex flex-col h-[min(76vh,620px)] min-h-[360px]">
          <div className="mb-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-2">
            <p className="text-xs font-semibold text-[var(--text-primary)]">Your digital growth guide</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">Ask about our published services and find a practical next step. For anything uncertain, I will direct you to our team.</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-1 sm:p-2" aria-live="polite" aria-label="Conversation">
            {messages.map((message, index) => (
              <div key={index} className={\`flex \${message.sender === 'user' ? 'justify-end' : 'justify-start'}\`}>
                <div className={\`max-w-[92%] sm:max-w-[86%] whitespace-pre-wrap rounded-2xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm leading-relaxed \${message.sender === 'user' ? 'bg-[var(--action-primary)] text-[var(--action-primary-text)] rounded-br-none' : 'bg-[var(--surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-none'}\`}>
                  {message.text}
                </div>
              </div>
            ))}
            {isSending && <p className="text-xs text-[var(--text-secondary)] px-2" role="status">GrowthBridge AI is thinking…</p>}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="pt-3 border-t border-[var(--border-subtle)] flex gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tell me about your business goal…"
              aria-label="Your message"
              maxLength={1600}
              className="py-2 text-sm flex-1 min-w-0"
              disabled={isSending}
            />
            <Button type="submit" size="sm" variant="primary" className="shrink-0 px-3 sm:px-4" disabled={isSending || !input.trim()}>
              Send
            </Button>
          </form>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={() => { setShowLeadForm((value) => !value); setLeadStatus(''); }} className="text-xs font-bold text-[var(--text-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-green-600)] rounded">
              {showLeadForm ? 'Close enquiry form' : 'Connect me with the team'}
            </button>
            <a href="/contact" className="text-xs text-[var(--text-secondary)] underline underline-offset-2">Contact page</a>
          </div>

          {leadStatus && <p className="mt-2 text-xs text-[var(--text-secondary)]" role="status">{leadStatus}</p>}

          {showLeadForm && (
            <form onSubmit={handleLeadSubmit} className="mt-3 space-y-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3">
              <p className="text-sm font-bold text-[var(--text-primary)]">Let our team follow up</p>
              <Input label="Your name" value={leadName} onChange={(event) => setLeadName(event.target.value)} required maxLength={100} />
              <Input label="Email address" type="email" value={leadEmail} onChange={(event) => setLeadEmail(event.target.value)} required maxLength={254} />
              <Input label="Phone (optional)" type="tel" value={leadPhone} onChange={(event) => setLeadPhone(event.target.value)} maxLength={30} />
              <label className="flex items-start gap-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-0.5 accent-[var(--gb-green-600)]" />
                I agree to share my contact details and the recent chat with GrowthBridge so the team can respond to my enquiry.
              </label>
              <Button type="submit" size="sm" variant="primary" fullWidth disabled={!consent || isSubmittingLead}>
                {isSubmittingLead ? 'Sending…' : 'Send enquiry'}
              </Button>
              <p className="text-[10px] leading-relaxed text-[var(--text-tertiary)]">Only the recent conversation is included. Do not share passwords, payment details or other sensitive information.</p>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}
