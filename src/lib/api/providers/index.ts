import type { BackendProvider } from '../backend-provider';
import { MockBackendProvider } from './mock';
import { KanyozaBackendProvider } from './kanyoza';
import { publicConfig } from '@/lib/config/public';
import { BackendUnavailableError } from '../errors';

let providerInstance: BackendProvider | null = null;

export function getBackendProvider(): BackendProvider {
  if (providerInstance) return providerInstance;

  const requested = publicConfig.NEXT_PUBLIC_BACKEND_PROVIDER;

  if (requested === 'mock' && publicConfig.NEXT_PUBLIC_USE_MOCK_DATA) {
    providerInstance = new MockBackendProvider();
  } else if (requested === 'kanyoza') {
    providerInstance = new KanyozaBackendProvider();
  } else {
    throw new BackendUnavailableError(
      `Unknown backend provider "${requested}". Set NEXT_PUBLIC_BACKEND_PROVIDER=kanyoza.`,
      { endpoint: `provider=${requested}`, statusCode: 500 }
    );
  }

  return providerInstance;
}

export function backendConnectionStatus() {
  return {
    provider: publicConfig.NEXT_PUBLIC_BACKEND_PROVIDER,
    allowMock: publicConfig.NEXT_PUBLIC_USE_MOCK_DATA,
    apiUrl: publicConfig.NEXT_PUBLIC_API_URL,
  };
}
