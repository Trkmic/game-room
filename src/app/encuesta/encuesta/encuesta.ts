import { Component, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LimitadorCaracteresPipe } from '../../core/pipes/limitador-caracteres.pipe';
import { HoverInputDirective } from '../../core/directives/hover-input.directive';
import { Router } from '@angular/router';
import { Encuesta } from '../../core/models/encuesta.model';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, FormsModule, LimitadorCaracteresPipe, HoverInputDirective],
  templateUrl: './encuesta.html',
  styleUrls: ['./encuesta.css'],
})
export class EncuestaComponent implements AfterViewInit {
  nombreApellido = signal('');
  edad = signal<number | null>(null);
  telefono = signal('');
  pregunta1 = signal('');
  pregunta2 = signal<string[]>([]);
  pregunta3 = signal('');

  mensaje = signal('');
  enviado = signal(false);

  maxNombreApellido = 50;
  maxPregunta1 = 200;

  nombreApellidoLength = computed(() => this.nombreApellido().length);
  pregunta1Length = computed(() => this.pregunta1().length);

  nombreApellidoError = computed(() =>
    !this.nombreApellido() ? 'Ingresá tu nombre y apellido' :
    this.nombreApellido().length < 2 ? 'Debe tener al menos 2 caracteres' : ''
  );

  edadError = computed(() => {
    if (this.edad() === null) return 'La edad es obligatoria';
    if (this.edad()! < 16) return 'Debes tener como mínimo 16 años';
    if (this.edad()! > 99) return 'Debe ser menor o igual a 99 años';
    return '';
  });

  telefonoError = computed(() => {
    const re = /^\d{1,10}$/;
    if (!this.telefono()) return 'Ingresá un teléfono';
    if (!re.test(this.telefono())) return 'Teléfono inválido (solo números, hasta 10 dígitos)';
    return '';
  });

  pregunta1Error = computed(() => !this.pregunta1() ? 'Esta respuesta es obligatoria' : '');
  pregunta2Error = computed(() => this.pregunta2().length === 0 ? 'Seleccioná al menos una opción' : '');
  pregunta3Error = computed(() => !this.pregunta3() ? 'Seleccioná una opción' : '');

  @ViewChild('nombreInput') nombreInput!: ElementRef;

  constructor(private supabaseService: SupabaseService,
              private router: Router) {}

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  ngAfterViewInit() {
    this.nombreInput.nativeElement.focus();
  }

  onNombreApellidoInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) this.nombreApellido.set(target.value.slice(0, this.maxNombreApellido));
  }

  onEdadInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) this.edad.set(target.valueAsNumber);
  }

  onTelefonoInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) this.telefono.set(target.value);
  }

  onPregunta1Input(event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    if (target) {
      const value = target.value.slice(0, this.maxPregunta1);
      this.pregunta1.set(value);
      target.value = value;
    }
  }

  onCheckboxChange(value: string, checked: boolean) {
    const current = [...this.pregunta2()];
    if (checked && !current.includes(value)) current.push(value);
    else if (!checked) current.splice(current.indexOf(value), 1);
    this.pregunta2.set(current);
  }

  async onSubmit() {
    this.enviado.set(true);
    this.mensaje.set('');

    if (this.edad() === null) return;
    const user = this.supabaseService.getUser();
    if (!user) {
      this.mensaje.set('❌ Debes iniciar sesión para enviar la encuesta');
      return;
    }

    try {
      await this.supabaseService.guardarEncuesta({
        user_id: user.id,
        nombreApellido: this.nombreApellido(),
        edad: this.edad()!,
        telefono: this.telefono(),
        pregunta1: this.pregunta1(),
        pregunta2: this.pregunta2(),
        pregunta3: this.pregunta3(),
        fecha: new Date().toISOString()
      });

      this.mensaje.set('✅ Encuesta enviada correctamente');
    } catch (error) {
      this.mensaje.set('❌ Error al guardar la encuesta');
    }
  }
}