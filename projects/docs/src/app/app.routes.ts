import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home') },
  { path: 'foundations', loadComponent: () => import('./pages/foundations') },
  { path: 'motion', loadComponent: () => import('./pages/motion') },
  {
    path: 'components',
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./pages/components') },
      { path: 'accordion', loadComponent: () => import('./pages/accordion') },
      { path: 'button', loadComponent: () => import('./pages/button') },
      { path: 'card', loadComponent: () => import('./pages/card') },
      { path: 'checkbox-radio-switch', loadComponent: () => import('./pages/choice') },
      { path: 'dialog', loadComponent: () => import('./pages/dialog') },
      { path: 'drawer', loadComponent: () => import('./pages/drawer') },
      { path: 'navbar', loadComponent: () => import('./pages/navbar') },
      { path: 'select', loadComponent: () => import('./pages/select') },
      { path: 'tabs', loadComponent: () => import('./pages/tabs') },
      { path: 'text-field', loadComponent: () => import('./pages/text-field') },
      { path: 'toast', loadComponent: () => import('./pages/toast') },
      { path: 'tooltip-popover', loadComponent: () => import('./pages/tooltip-popover') },
    ],
  },
  { path: '**', loadComponent: () => import('./pages/not-found') },
];
