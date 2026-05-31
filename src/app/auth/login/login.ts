import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService} from '../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  registeredUsers: any[] = []; // puedes dejar vacío por ahora
  email: string = '';
  password: string = '';
  errorMessage = signal('');
  loading = signal(false);

  quickUsers = [
    { email: 'admin@test.com', password: 'admin123', displayName: '👑 Admin' },
    { email: 'user1@test.com', password: 'user123', displayName: '👤 User 1'},
    { email: 'user2@test.com', password: 'user123', displayName: '👤 User 2'}
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f(): { [key: string]: FormControl } {
    return this.loginForm.controls as { [key: string]: FormControl };
  }

  async onSubmit() {
    this.submitted = true;
    this.errorMessage.set('');
    this.loading.set(true);
  
    if (this.loginForm.invalid) {
      this.errorMessage.set('Por favor completa todos los campos correctamente.');
      this.loading.set(false);
      return;
    }
  
    const email = this.f['email'].value.trim();
    const password = this.f['password'].value.trim();
    
    try {
      const result = await this.supabaseService.login(email, password);
  
      if (!result.success) {
        const err = result.error;
        const msg = typeof err === 'string' ? err : (err && typeof err === 'object' ? (err as any).message || JSON.stringify(err) : 'Error al iniciar sesión');
        this.errorMessage.set(msg);
      } else {
        // todo se procese
        const nav = await this.router.navigate(['/home']);
        if (!nav) {
          this.errorMessage.set('No se pudo navegar a home. Revisa los guards.');
        }
      }
    } catch (err) {
      this.errorMessage.set('Error al conectarse al servidor');
    } finally {
      this.loading.set(false); // siempre se desactiva
    }
  }

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }

  goToQuienSoy(): void {
    this.router.navigate(['/quien-soy']);
  }

  async quickLogin(index: number): Promise<void> {
    const { email, password } = this.quickUsers[index];
  
    this.loginForm.patchValue({ email, password });
    this.submitted = true;
    this.errorMessage.set('');
    this.loading.set(true);
  
    try {
      const result = await this.supabaseService.login(email, password);
  
      if (!result.success) {
        const err = result.error;
        const msg = typeof err === 'string' ? err : (err && typeof err === 'object' ? (err as any).message || JSON.stringify(err) : 'Error al iniciar sesión');
        this.errorMessage.set(msg);
      } else {
        const nav = await this.router.navigate(['/home']);
        if (!nav) {
          this.errorMessage.set('No se pudo navegar a home. Revisa los guards.');
        }
      }
    } catch (err) {
      this.errorMessage.set('Error al conectarse al servidor');
    } finally {
      this.loading.set(false);
    }
  }

}