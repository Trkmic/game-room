import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService} from '../../core/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router, private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  get f(): { [key: string]: FormControl } {
    return this.registerForm.controls as { [key: string]: FormControl };
  }

  passwordsMatch(group: AbstractControl) {
    const password = group.get('password');
    const confirm = group.get('confirmPassword');

    if (!password || !confirm) return null;
    if (confirm.errors && !confirm.errors['mustMatch']) return null;

    if (password.value !== confirm.value) {
      confirm.setErrors({ mustMatch: true });
    } else {
      confirm.setErrors(null);
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) return;

    const { nombre, apellido, edad, email, password } = this.registerForm.value;
    const { success, error } = await this.supabaseService.register(email, password, { nombre, apellido, edad, email, role: 'user' });

    if (error) {
      this.errorMessage = error;
      return;
    }

    this.router.navigate(['/home']);

  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}