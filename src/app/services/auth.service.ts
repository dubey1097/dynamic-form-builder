import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
    email: string;
    role: 'admin' | 'user';
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    private readonly VALID_USERS = [
        { email: 'admin@gmail.com', password: 'admin123', role: 'admin' as const },
        { email: 'user@gmail.com', password: 'user123', role: 'user' as const }
    ];

    constructor(private router: Router) {
        this.checkStoredSession();
    }

    private checkStoredSession(): void {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                this.currentUserSubject.next(user);
            } catch {
                this.clearSession();
            }
        }
    }

    private clearSession(): void {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    login(email: string, password: string): boolean {
        const user = this.VALID_USERS.find(u => u.email === email && u.password === password);
        if (user) {
            const currentUser = { email: user.email, role: user.role };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            this.currentUserSubject.next(currentUser);
            return true;
        }
        return false;
    }

    logout(): void {
        this.clearSession();
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return !!this.currentUserSubject.value;
    }

    isAdmin(): boolean {
        return this.currentUserSubject.value?.role === 'admin';
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
} 