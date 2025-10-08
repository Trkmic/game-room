import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ActividadService } from '../services/actividad.service';
import { SupabaseService } from '../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class InactividadGuard implements CanActivate {

    constructor(
        private actividadService: ActividadService,
        private supabaseService: SupabaseService,
        private router: Router
    ) {}

    async canActivate(): Promise<boolean> {
        // Si está logueado pero la sesión expiró
        if (this.supabaseService.isLoggedIn() && this.actividadService.isSessionExpired()) {
        await this.supabaseService.logout();
        this.router.navigate(['/login']);
        return false;
        }
        return true;
    }
}