import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  // Not authenticated or not admin - redirect based on auth state
  if (!authService.isAuthenticated()) {
    router.navigate(['/admin/login'], {
      queryParams: { returnUrl: router.url },
    });
  } else {
    // Authenticated but not admin - go to regular user dashboard
    router.navigate(['/dashboard']);
  }
  return false;
};
