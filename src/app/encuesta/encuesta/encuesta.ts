import { Component, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { CommonModule } from '@angular/common';
import { LimitadorCaracteresPipe } from '../../core/pipes/limitador-caracteres.pipe';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule,LimitadorCaracteresPipe],
  templateUrl: './encuesta.html',
  styleUrls: ['./encuesta.css'],
})
export class Encuesta implements AfterViewInit {

  // Signals para cada campo
  nombreApellido = signal('');
  edad = signal<number | null>(null);
  telefono = signal('');
  pregunta1 = signal('');
  pregunta2 = signal<string[]>([]);
  pregunta3 = signal('');

  // Mensajes
  mensaje = signal('');
  enviado = signal(false);

  // Máximos de caracteres
  maxNombreApellido = 50;
  maxPregunta1 = 200;

  // Contadores
  nombreApellidoLength = computed(() => this.nombreApellido().length);
  pregunta1Length = computed(() => this.pregunta1().length);

  // Validaciones en vivo
  nombreApellidoError = computed(() => !this.nombreApellido() ? 'Ingresá tu nombre y apellido' :
                            this.nombreApellido().length < 2 ? 'Debe tener al menos 2 caracteres' : '');
  edadError = computed(() => {
    if (this.edad() === null) return 'La edad es obligatoria';
    if (this.edad()! < 18) return 'Debes ser mayor o igual a 18 años';
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

  // Hover signals
  hoveredInputs = signal<{ [key: string]: boolean }>({});

  // Autofocus
  @ViewChild('nombreInput') nombreInput!: ElementRef;

  constructor(private supabaseService: SupabaseService) {}

  ngAfterViewInit() {
    this.nombreInput.nativeElement.focus();
  }

  // Métodos para inputs
  onNombreApellidoInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) this.nombreApellido.set(target.value);
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
      target.value = value; // Actualiza el textarea para que no exceda
    }
  }

  // Manejo de checkboxes
  onCheckboxChange(value: string, checked: boolean) {
    const current = [...this.pregunta2()];
    if (checked && !current.includes(value)) current.push(value);
    else if (!checked) current.splice(current.indexOf(value), 1);
    this.pregunta2.set(current);
  }

  // Submit
  async onSubmit() {
    this.enviado.set(true);
    this.mensaje.set('');

    if (this.nombreApellidoError() || this.edadError() || this.telefonoError() ||
        this.pregunta1Error() || this.pregunta2Error() || this.pregunta3Error()) {
      return;
    }

    try {
      await this.supabaseService.guardarEncuesta({
        nombreapellido: this.nombreApellido(),
        edad: this.edad(),
        telefono: this.telefono(),
        pregunta1: this.pregunta1(),
        pregunta2: this.pregunta2(),
        pregunta3: this.pregunta3(),
        fecha: new Date().toISOString()
      });

      this.mensaje.set('✅ Encuesta enviada correctamente');

      // Reset
      this.nombreApellido.set('');
      this.edad.set(null);
      this.telefono.set('');
      this.pregunta1.set('');
      this.pregunta2.set([]);
      this.pregunta3.set('');
      this.enviado.set(false);
      this.hoveredInputs.set({});
      this.nombreInput.nativeElement.focus();

    } catch (error) {
      console.error(error);
      this.mensaje.set('❌ Error al guardar la encuesta');
    }
  }

  // Hover helpers
  onMouseEnter(field: string) {
    this.hoveredInputs.set({ ...this.hoveredInputs(), [field]: true });
  }
  onMouseLeave(field: string) {
    this.hoveredInputs.set({ ...this.hoveredInputs(), [field]: false });
  }

}
