import { Injectable } from '@angular/core';
import { Encuesta } from '../models/encuesta.model';

@Injectable({ providedIn: 'root' })
export class EncuestaService {
  encuestas: Encuesta[] = [];

  guardarEncuesta(encuesta: Encuesta) {
    this.encuestas.push(encuesta);
  }

  obtenerEncuestas() {
    return this.encuestas;
  }
}