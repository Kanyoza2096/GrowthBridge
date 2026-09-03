import type { BackendProvider } from '../backend-provider';
import { MockBackendProvider } from './mock';
import { SupabaseBackendProvider } from './supabase';
import { publicConfig } from '@/lib/config/public';

let providerInstance: BackendProvider | null = null;

export function getBackendProvider(): BackendProvider {
  if (providerInstance) return providerInstance;

  // Use Mock provider only if explicitly configured in development/test
  if (process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DATA === 'true') {
    providerInstance = new MockBackendProvider();
    return providerInstance;
  }

  providerInstance = new SupabaseBackendProvider();
  return providerInstance;
}

export function backendConnectionStatus() {
  return {
    provider: 'supabase',
    supabaseUrl: publicConfig.NEXT_PUBLIC_SUPABASE_URL,
    allowMock: process.env.USE_MOCK_DATA === 'true',
  };
}
