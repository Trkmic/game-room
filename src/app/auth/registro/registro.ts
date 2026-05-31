import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LimitadorCaracteresPipe } from '../../core/pipes/limitador-caracteres.pipe';
import { HoverInputDirective } from '../../core/directives/hover-input.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, LimitadorCaracteresPipe, FormsModule,HoverInputDirective],
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

  // Contadores
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
    if (!this.email()) return 'El email es obligatorio';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(this.email())) return 'Formato de email inválido';
    const dominiosPermitidos = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
    const dominio = this.email().split('@')[1]?.toLowerCase();
    if (!dominiosPermitidos.includes(dominio)) return 'Solo se permiten Gmail, Hotmail, Outlook o Yahoo';
    return '';
  });

  edadError = computed(() => {
    if (this.edad() === null) return 'La edad es obligatoria';
    if (this.edad()! < 16) return 'Debes ser mayor o igual a 16 años';
    if (this.edad()! > 99) return 'Debe ser menor o igual a 99 años';
    return '';
  });

  passwordError = computed(() =>
    !this.password() || this.password().length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : ''
  );

  confirmPasswordError = computed(() =>
    this.password() !== this.confirmPassword() ? 'Las contraseñas no coinciden' : ''
  );

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private notificacion: NotificacionService
  ) {}

  async onSubmit() {
    if (
      this.nombreError() ||
      this.apellidoError() ||
      this.emailError() ||
      this.edadError() ||
      this.passwordError() ||
      this.confirmPasswordError()
    ) {
      this.notificacion.mostrar('Por favor corregí los errores en el formulario.', 'error');
      return;
    }
  
    const result = await this.supabase.register(
      this.email(),
      this.password(),
      this.nombre(),
      this.apellido(),
      this.edad()! // Forzamos que no sea null porque ya se valido
    );
  
    if (!result.success) {
      this.notificacion.mostrar(result.error || 'Ocurrió un error en el registro', 'error');
      return;
    }
  
    this.notificacion.mostrar('¡Registro exitoso! Bienvenido.', 'exito');
    this.router.navigate(['/home']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Métodos para limitar caracteres
  onNombreInput(value: string) {
    this.nombre.set(value.slice(0, this.maxNombre));
  }

  onApellidoInput(value: string) {
    this.apellido.set(value.slice(0, this.maxApellido));
  }

  onPasswordInput(value: string) {
    this.password.set(value.slice(0, this.maxPassword));
  }

  onConfirmPasswordInput(value: string) {
    this.confirmPassword.set(value.slice(0, this.maxPassword));
  }
}