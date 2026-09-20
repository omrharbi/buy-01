import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

/**
 * Public routes are the two product GETs and the auth pages. Everything else needs a session;
 * the seller area needs the SELLER role on top of it.
 *
 * Every feature is lazy: the catalog a client browses never downloads the seller tooling.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: 'products',
    title: 'Products — Buy-01',
    loadComponent: () => import('./features/catalog/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'products/:id',
    title: 'Product — Buy-01',
    loadComponent: () =>
      import('./features/catalog/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'sign-in',
    title: 'Sign in — Buy-01',
    loadComponent: () => import('./features/auth/sign-in/sign-in').then((m) => m.SignIn),
  },
  {
    path: 'sign-up',
    title: 'Create an account — Buy-01',
    loadComponent: () => import('./features/auth/sign-up/sign-up').then((m) => m.SignUp),
  },
  {
    path: 'profile',
    title: 'Your profile — Buy-01',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'seller',
    canActivate: [roleGuard],
    data: { role: 'SELLER' },
    children: [
      {
        path: 'dashboard',
        title: 'Seller dashboard — Buy-01',
        loadComponent: () => import('./features/seller/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'products/new',
        title: 'New product — Buy-01',
        loadComponent: () =>
          import('./features/seller/product-form/product-form').then((m) => m.ProductForm),
      },
      {
        path: 'products/:id/edit',
        title: 'Edit product — Buy-01',
        loadComponent: () =>
          import('./features/seller/product-form/product-form').then((m) => m.ProductForm),
      },
      {
        path: 'media',
        title: 'Your images — Buy-01',
        loadComponent: () =>
          import('./features/seller/media-manager/media-manager').then((m) => m.MediaManager),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'forbidden',
    title: "That's for sellers — Buy-01",
    loadComponent: () => import('./features/errors/forbidden').then((m) => m.Forbidden),
  },
  {
    path: '**',
    title: 'Not found — Buy-01',
    loadComponent: () => import('./features/errors/not-found').then((m) => m.NotFound),
  },
];
