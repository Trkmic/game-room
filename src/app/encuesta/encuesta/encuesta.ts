import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { SupabaseService } from '../../core/supabase.service';


@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './encuesta.html',
  styleUrls: ['./encuesta.css'],
})

export class Encuesta implements OnInit {
  encuestaForm!: FormGroup;
  enviado = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.encuestaForm = this.fb.group({
      nombreApellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      pregunta1: ['', Validators.required],
      pregunta2: this.fb.array([], Validators.required),
      pregunta3: ['', Validators.required]
    });
  }

  get pregunta2Array(): FormArray {
    return this.encuestaForm.get('pregunta2') as FormArray;
  }

  onCheckboxChange(event: any) {
    const selected = this.pregunta2Array;
    if (event.target.checked) {
      selected.push(this.fb.control(event.target.value));
    } else {
      const i = selected.controls.findIndex(x => x.value === event.target.value);
      if (i >= 0) selected.removeAt(i);
    }
    selected.markAsTouched();
  }

  async onSubmit() {
    this.enviado = true;
    this.mensaje = '';

    // Validación manual para el FormArray
    if (this.pregunta2Array.length === 0) {
      this.pregunta2Array.setErrors({ required: true });
    }

    if (this.encuestaForm.invalid) return;

    try {
      await this.supabaseService.guardarEncuesta({
        nombreapellido: this.encuestaForm.value.nombreApellido,
        edad: this.encuestaForm.value.edad,
        telefono: this.encuestaForm.value.telefono,
        pregunta1: this.encuestaForm.value.pregunta1,
        pregunta2: this.encuestaForm.value.pregunta2,
        pregunta3: this.encuestaForm.value.pregunta3,
        fecha: new Date().toISOString()
      });

      this.mensaje = '✅ Encuesta enviada correctamente';
      this.encuestaForm.reset();
      this.pregunta2Array.clear();
      this.enviado = false;

    } catch (error) {
      console.error('Error guardando encuesta:', error);
      this.mensaje = '❌ Error al guardar la encuesta';
    }
  }
}