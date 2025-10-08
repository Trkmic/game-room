import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { CommonModule } from '@angular/common';
import { LimitadorCaracteresPipe } from '../../core/pipes/limitador-caracteres.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,LimitadorCaracteresPipe],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {

  // Signals
  nombre = signal('');
  apellido = signal('');
  email = signal('');
  edad = signal<number | null>(null);
  password = signal('');
  confirmPassword = signal('');

  // Máximos de caracteres
  maxNombre = 20;
  maxApellido = 20;
  maxPassword = 30;

  // Computed
  nombreLength = computed(() => this.nombre().length);
  apellidoLength = computed(() => this.apellido().length);
  passwordLength = computed(() => this.password().length);

  // Validaciones
  nombreError = computed(() =>
    !this.nombre() ? 'El nombre es obligatorio' :
    this.nombre().length < 2 ? 'Debe tener al menos 2 caracteres' : ''
  );

  apellidoError = computed(() =>
    !this.apellido() ? 'El apellido es obligatorio' :
    this.apellido().length < 2 ? 'Debe tener al menos 2 caracteres' : ''
  );

  emailError = computed(() => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email()) return 'El email es obligatorio';
    if (!re.test(this.email())) return 'Formato de email inválido';
    return '';
  });

  edadError = computed(() => {
    if (this.edad() === null) return 'La edad es obligatoria';
    if (this.edad()! < 18) return 'Debes ser mayor o igual a 18 años';
    if (this.edad()! > 99) return 'Debe ser menor o igual a 99 años';
    return '';
  });

  passwordError = computed(() =>
    !this.password() || this.password().length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : ''
  );

  confirmPasswordError = computed(() =>
    this.password() !== this.confirmPassword() ? 'Las contraseñas no coinciden' : ''
  );

  constructor(private router: Router, private supabase: SupabaseService) {}

  async onSubmit() {
    if (
      this.nombreError() ||
      this.apellidoError() ||
      this.emailError() ||
      this.edadError() ||
      this.passwordError() ||
      this.confirmPasswordError()
    ) return;
  
    // Llamada al servicio
    const result = await this.supabase.register(
      this.email(),
      this.password(),
      { nombre: this.nombre(), apellido: this.apellido(), edad: this.edad() }
    );
  
    if (!result.success) {
      console.error('Error al registrar usuario:', result.error);
      return;
    }
  
    console.log('Usuario registrado correctamente');
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}