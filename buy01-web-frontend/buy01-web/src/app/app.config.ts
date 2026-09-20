import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { errorInterceptor } from './core/http/error.interceptor';
import { mockApiInterceptor } from './core/mock/mock-api.interceptor';
import { tokenInterceptor } from './core/http/token.interceptor';
import { routes } from './app.routes';

/**
 * Interceptor order matters: the token is attached first, the error interceptor wraps the
 * result, and the mock sits innermost so it sees exactly what the gateway would.
 * `mockApiInterceptor` returns immediately when `environment.useMockApi` is false.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor, mockApiInterceptor])),
  ],
};
