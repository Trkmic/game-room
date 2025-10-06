import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService} from '../../core/supabase.service';

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
  errorMessage: string = '';
  loading: boolean = false;

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
    this.errorMessage = '';
    this.loading = true;
  
    // Validar formulario
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente.';
      this.loading = false;
      return;
    }
  
    const email = this.f['email'].value.trim();
    const password = this.f['password'].value.trim();
    
    try {
      const result = await this.supabaseService.login(email, password);
      if (!result.success) {
        this.errorMessage = result.error || 'Error desconocido';
      } else {
        // Redirigir a home u otra página
        this.router.navigate(['/home']);
      }
    } catch (err) {
      this.errorMessage = 'Error al conectarse al servidor';
    }
  
    this.loading = false;
  }

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }

  goToQuienSoy(): void {
    this.router.navigate(['/quien-soy']);
  }

  async quickLogin(index: number): Promise<void> {
    const { email, password } = this.quickUsers[index];
  
    this.loginForm.patchValue({
      email,
      password
    });
  
    this.submitted = true;
    this.errorMessage = '';
    this.loading = true;
  
    try {
      const result = await this.supabaseService.login(email, password);
      if (!result.success) {
        this.errorMessage = result.error || 'Error desconocido';
      }
    } catch (err) {
      this.errorMessage = 'Error al conectarse al servidor';
    }
  
    this.loading = false;
  }

}