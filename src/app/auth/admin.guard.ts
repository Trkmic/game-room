import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../core/supabase.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService, private router: Router) {}

  canActivate(): boolean {
    if (this.supabaseService.isLoggedIn() && this.supabaseService.isAdmin()) return true;
    this.router.navigate(['/home']);
    return false;
  }
}