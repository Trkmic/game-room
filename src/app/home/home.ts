import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService} from '../core/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  user: any = null;
  private userSub?: Subscription;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 🔹 Suscribirse al observable de usuario
    this.userSub = this.supabaseService.user$.subscribe(u => {
      this.user = u;
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  async logout(): Promise<void> {
    try {
      await this.supabaseService.logout();
      console.log('Sesión cerrada');
      this.router.navigate(['/']);
      // Aquí, isLoggedIn se actualizará automáticamente por la suscripción a user$
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    }
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  get isLoggedIn(): boolean {
    return this.user !== null;
  }

  goToChat() {
    if (!this.isLoggedIn) return;
    this.router.navigate(['/chat']);
  }
  
  goToResultados() {
    if (!this.isLoggedIn) return;
    this.router.navigate(['/resultados']);
  }
  
  goToQuienSoy() {
    this.router.navigate(['/quien-soy']);
  }

}