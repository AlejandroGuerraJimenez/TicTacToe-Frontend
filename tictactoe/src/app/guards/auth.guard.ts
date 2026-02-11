import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { take, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('AuthGuard activating for route:', state.url);

    // 1. Si ya tenemos usuario en estado local, permitimos acceso
    if (authService.isAuthenticated()) {
        console.log('AuthGuard: User authenticated locally');
        return true;
    }

    console.log('AuthGuard: Checking session with backend...');
    // 2. Si no, intentamos verificar la sesión con el backend (cookie)
    return authService.checkSession().pipe(
        take(1), // Completar después de la primera emisión
        tap(isAuthenticated => {
            console.log('AuthGuard: Session check result:', isAuthenticated);
            if (!isAuthenticated) {
                console.log('AuthGuard: Redirecting to login');
                router.navigate(['/login']);
            }
        })
    );
};
