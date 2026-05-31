import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService} from '../core/services/supabase.service';
import { DisplayNamePipe } from '../core/pipes/display-name.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, DisplayNamePipe],
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
      this.user = null;
  
      // 🔹 2. Cierra sesión en Supabase (sin bloquear la UI)
      await this.supabaseService.logout();
  
    } catch (err) {
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