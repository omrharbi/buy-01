/**
 * Development settings. Set `useMockApi` to false to talk to the real API gateway.
 * The gateway exposes the auth endpoints at /auth, not /api/auth.
 */
export const environment = {
  production: false,
  apiBase: 'https://localhost:8443',
  useMockApi: false,
};
