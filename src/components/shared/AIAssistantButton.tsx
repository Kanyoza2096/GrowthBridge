'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AIAssistantButton() {
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    // Simulated AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Thank you for asking about "${userText}". Our Growthbridge AI engine is currently in preview mode. You can explore our Services tab or contact our team directly at kmadalitso01@gmail.com!`,
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 p-3.5 sm:p-4 rounded-full bg-[var(--gradient-brand)] text-white shadow-2xl shadow-[var(--gb-green-600)]/40 hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer border border-white/20"
        aria-label="Open AI Assistant"
      >
        <div className="relative flex items-center justify-center">
          {/* Live indicator dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
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
        title="Growthbridge AI Assistant"
      >
        <div className="flex flex-col h-[350px] sm:h-[400px]">
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

          {/* Form Input */}
          <form
            onSubmit={handleSend}
            className="pt-2 sm:pt-3 border-t border-[var(--border-subtle)] flex gap-1.5 sm:gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Growthbridge AI..."
              className="py-2 text-xs flex-1 min-w-0"
            />
            <Button type="submit" size="sm" variant="primary" className="shrink-0 px-3 sm:px-4">
              Send
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
