/**
 * Production settings. `apiBase` points at the gateway, which fronts the User, Product
 * and Media services and applies CORS and auth propagation.
 */
export const environment = {
  production: true,
  apiBase: '/api',
  useMockApi: false,
};
