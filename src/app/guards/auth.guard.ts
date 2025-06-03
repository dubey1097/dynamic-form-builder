import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login']);
            return false;
        }

        const requiredRole = route.data['role'];
        if (requiredRole && requiredRole === 'admin' && !this.authService.isAdmin()) {
            this.router.navigate(['/forms']);
            return false;
        }

        return true;
    }
} 