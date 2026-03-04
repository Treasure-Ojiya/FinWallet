import { HttpInterceptorFn } from '@angular/common/http';

const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-account',
  '/auth/resend-otp',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Do NOT attach token to auth endpoints
  console.log('Request URL:', req.url); // Add this to see what URLs are being called

  if (PUBLIC_ENDPOINTS.some((url) => req.url.includes(url))) {
    console.log('Public endpoint, no token attached');
    return next(req);
  }

  const token = localStorage.getItem('token');
  console.log('Token present:', !!token);

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
