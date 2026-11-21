export type InquirySource = 'application' | 'contact' | 'partnership';
export type InquiryStatus = 'new' | 'contacted' | 'closed';

export type AgentLeadAnalysis = {
  classification: 'sales_lead' | 'support_request' | 'partnership' | 'general' | 'spam_or_abuse';
  priority: 'low' | 'normal' | 'high';
  summary: string;
  reply_draft: string;
  recommended_services: string[];
  missing_information: string[];
  suggested_next_step: string;
  confidence: number;
  risk_flags: string[];
};

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
  agentStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  agentAnalysis?: AgentLeadAnalysis;
  notes: { id: string; authorId: string; authorName: string; content: string; createdAt: string }[];
  history: { id: string; action: string; oldStatus?: InquiryStatus; newStatus?: InquiryStatus; actorId: string; actorName: string; timestamp: string }[];
}
