/**
 * Development settings. `useMockApi` runs the app against an in-memory backend
 * (see core/mock/mock-api.interceptor.ts) so the SPA is clickable with no services
 * running. Set it to false and point `apiBase` at the gateway to talk to the real API.
 */
export const environment = {
  production: false,
  apiBase: 'http://localhost:8080',
  useMockApi: true,
};
