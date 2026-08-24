// API Client entry point for the application
// Uses publicConfig only — never imports server secrets.

import { getBackendProvider } from './providers';

export const apiClient = getBackendProvider();

export * from './backend-provider';
export * from './providers';
