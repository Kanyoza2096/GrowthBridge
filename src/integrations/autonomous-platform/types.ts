// src/integrations/autonomous-platform/types.ts

export interface ContentGenerationRequest {
  topic: string;
  category?: string;
  tone?: string;
  targetAudience?: string;
  keywords?: string[];
  length?: 'short' | 'medium' | 'long';
}

export interface ContentResult {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  seoKeywords: string[];
}

export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  aspectRatio?: string;
}

export interface ImageResult {
  url: string;
  altText: string;
}

export interface ApplicationAnalysis {
  applicationId: string;
  extractedSkills: string[];
  matchScore: number;
  categoryRecommendation: string;
  summary: string;
  strengths: string[];
  recommendation: 'strong_hire' | 'interview' | 'hold' | 'reject';
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'recommendation' | 'anomaly';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionableStep?: string;
}

export interface WorkflowResult {
  workflowId: string;
  status: 'completed' | 'failed' | 'in_progress';
  result?: any;
  error?: string;
}

export interface AutomationStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
}
