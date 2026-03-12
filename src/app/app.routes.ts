import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },

  {
    path: 'auth',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/auth/login/login').then((m) => m.Login),
        data: { hideLayout: true },
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register').then((m) => m.Register),
        data: { hideLayout: true },
      },
      {
        path: 'verify-account',
        loadComponent: () =>
          import('./pages/auth/verify-account/verify-account').then(
            (m) => m.VerifyAccount,
          ),
        data: { hideLayout: true },
      },
      {
        path: 'resend-otp',
        loadComponent: () =>
          import('./pages/auth/resend-otp/resend-otp').then((m) => m.ResendOTP),
        data: { hideLayout: true },
      },
    ],
  },

  {
    path: 'overview',
    loadComponent: () =>
      import('./pages/overview/overview/overview').then((m) => m.Overview),
  },

  {
    path: 'transactions',
    loadComponent: () =>
      import('./pages/transactions/transactions').then((m) => m.Transactions),
  },

  {
    path: 'wallet-details',
    loadComponent: () =>
      import('./pages/wallet-details/wallet-details').then(
        (m) => m.WalletDetails,
      ),
  },

  {
    path: 'account-details',
    loadComponent: () =>
      import('./pages/account-details/account-details').then(
        (m) => m.AccountDetails,
      ),
  },

  {
    path: 'top-up',
    loadComponent: () => import('./pages/top-up/top-up').then((m) => m.TopUp),
  },

  {
    path: 'transfer',
    loadComponent: () =>
      import('./pages/transfer/transfer').then((m) => m.Transfer),
  },
];
