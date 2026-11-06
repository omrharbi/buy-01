/**
 * Development settings. Set `useMockApi` to false to talk to the real API gateway.
 * The gateway exposes the API under the `/api` prefix, matching the backend routes.
 */
export const environment = {
  production: false,
  apiBase: 'http://localhost:8080/api',
  useMockApi: false,
};
