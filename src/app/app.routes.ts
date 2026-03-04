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
      // {
      //   path: '',
      //   loadComponent: () =>
      //     import('./pages/auth/auth-page/auth-page').then((m) => m.AuthPage),
      // },
      {
        path: '',
        loadComponent: () =>
          import('./pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register').then((m) => m.Register),
      },
      {
        path: 'verify-account',
        loadComponent: () =>
          import('./pages/auth/verify-account/verify-account').then(
            (m) => m.VerifyAccount,
          ),
      },
      {
        path: 'resend-otp',
        loadComponent: () =>
          import('./pages/auth/resend-otp/resend-otp').then((m) => m.ResendOTP),
      },
    ],
  },

  {
    path: 'overview',
    loadComponent: () =>
      import('./pages/overview/overview/overview').then((m) => m.Overview),
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
