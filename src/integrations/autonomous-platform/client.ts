// src/integrations/autonomous-platform/client.ts
import { serverConfig } from '@/lib/config/server';
import { publicConfig } from '@/lib/config/public';
import { CircuitBreaker, withTimeout } from './resilience';
import type {
  ContentGenerationRequest,
  ContentResult,
  ImageGenerationRequest,
  ImageResult,
  ApplicationAnalysis,
  AIInsight,
  WorkflowResult,
  AutomationStatus,
} from './types';

export class AutonomousPlatformClient {
  private enabled: boolean;
  private baseUrl?: string;
  private apiKey?: string;
  private breaker = new CircuitBreaker();

  constructor() {
    this.enabled =
      publicConfig.NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED &&
      Boolean(serverConfig.AUTONOMOUS_PLATFORM_URL);
    this.baseUrl = serverConfig.AUTONOMOUS_PLATFORM_URL?.replace(/\/$/, '');
    this.apiKey = serverConfig.AUTONOMOUS_PLATFORM_API_KEY;
  }

  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    if (!this.enabled || !this.baseUrl) {
      return null;
    }

    return this.breaker.execute(async () => {
      const correlationId = crypto.randomUUID();
      const response = await withTimeout(
        fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Correlation-ID': correlationId,
            ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
            ...(options.headers || {}),
          },
        }),
        15000 // 15-second timeout
      );

      if (!response.ok) {
        throw new Error(`Autonomous Platform error: HTTP ${response.status}`);
      }

      const json = await response.json();
      return (json.data ?? json) as T;
    });
  }

  async generateContent(req: ContentGenerationRequest): Promise<ContentResult | null> {
    return this.fetchApi<ContentResult>('/api/v1/ai/content/generate', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async generateImage(req: ImageGenerationRequest): Promise<ImageResult | null> {
    return this.fetchApi<ImageResult>('/api/v1/ai/images/generate', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async analyzeApplication(applicationId: string, payload: any): Promise<ApplicationAnalysis | null> {
    return this.fetchApi<ApplicationAnalysis>(`/api/v1/ai/applications/${encodeURIComponent(applicationId)}/analyze`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAIInsights(resource: string, resourceId: string): Promise<AIInsight[] | null> {
    return this.fetchApi<AIInsight[]>(`/api/v1/ai/insights/${encodeURIComponent(resource)}/${encodeURIComponent(resourceId)}`);
  }

  async executeWorkflow(workflowId: string, payload: any): Promise<WorkflowResult | null> {
    return this.fetchApi<WorkflowResult>(`/api/v1/workflows/${encodeURIComponent(workflowId)}/execute`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAutomationStatus(jobId: string): Promise<AutomationStatus | null> {
    return this.fetchApi<AutomationStatus>(`/api/v1/automations/jobs/${encodeURIComponent(jobId)}`);
  }
}

export const autonomousPlatformClient = new AutonomousPlatformClient();
