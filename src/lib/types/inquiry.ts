export type InquirySource = 'application' | 'contact' | 'partnership';
export type InquiryStatus = 'new' | 'contacted' | 'closed';

export interface Inquiry {
  id: string;
  source: InquirySource;
  type: 'general' | 'partnership' | 'talent' | 'client';
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
  status: InquiryStatus;
  submittedAt: string;
  assignee?: string;
  notes: { id: string; authorId: string; authorName: string; content: string; createdAt: string }[];
  history: { id: string; action: string; actorId: string; actorName: string; timestamp: string }[];
}
