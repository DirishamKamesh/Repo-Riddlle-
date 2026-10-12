import { ApiClient } from './client';
import { DemoApiAdapter } from './demo-adapter';
import { RealApiAdapter } from './api-adapter';

export * from './client';
export * from './demo-adapter';
export * from './api-adapter';

export const demoApi = new DemoApiAdapter();
export const realApi = new RealApiAdapter();

export function getApiClient(idOrUrl?: string): ApiClient {
  if (!idOrUrl || idOrUrl === 'demo' || idOrUrl === 'demo-task-api') {
    return demoApi;
  }
  return realApi;
}
