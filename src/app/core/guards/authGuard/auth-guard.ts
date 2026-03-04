import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');

    if (!token) {
      return this.router.createUrlTree(['/auth']);
    }

    // OPTIONAL: basic JWT expiration check
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;

      if (isExpired) {
        localStorage.removeItem('token');
        return this.router.createUrlTree(['/auth']);
      }
    } catch {
      localStorage.removeItem('token');
      return this.router.createUrlTree(['/auth']);
    }

    return true;
  }
}
