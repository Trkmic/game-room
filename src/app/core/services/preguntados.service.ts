import { Injectable } from '@angular/core';
import { Pregunta } from '../models/partida.model';
import { ResultadosService } from '../services/resultados.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PreguntadosService {
  preguntas: Pregunta[] = [];
  preguntasCategoria: Pregunta[] = [];
  preguntaActual = 0;
  aciertos = 0; // aciertos de la categoría actual
  terminado = false; // si el juego completo terminó
  perdido = false;
  categoriaSeleccionada = '';
  categoriaTerminada = false; // si terminó la categoría
  categoriasCompletadas: string[] = [];

  constructor(
    private resultadosService: ResultadosService,
    private http: HttpClient
  ) {}

  async cargarPreguntas() {
    this.preguntas = await firstValueFrom(
      this.http.get<Pregunta[]>('/db/preguntados.json')
    );
  }

  iniciarCategoria(categoria: string): boolean {
    if (!this.obtenerCategoriasDisponibles().includes(categoria)) return false;
    this.categoriaSeleccionada = categoria;
    this.categoriaTerminada = false;
    this.preguntasCategoria = this.preguntas.filter(p => p.categoria === categoria);
    this.preguntaActual = 0;
    this.aciertos = 0;
    return true;
  }

  obtenerCategoriasDisponibles(): string[] {
    return [...new Set(this.preguntas.map(p => p.categoria))]
      .filter(c => !this.categoriasCompletadas.includes(c));
  }

  /** Devuelve true si la respuesta fue correcta */
  async responder(opcionIndex: number): Promise<boolean> {
    const pregunta = this.preguntasCategoria[this.preguntaActual];
    if (!pregunta) return false;

    let correcta = false;

    if (pregunta.correcta === opcionIndex) {
      this.aciertos++;
      correcta = true;
    } else {
      this.perdido = true;
      this.terminado = true;
      return false;
    }

    this.preguntaActual++;

    // Si terminó la categoría
    if (this.preguntaActual >= this.preguntasCategoria.length) {
      this.categoriasCompletadas.push(this.categoriaSeleccionada);
      this.categoriaTerminada = true;
      this.categoriaSeleccionada = '';
      this.preguntasCategoria = [];
      this.preguntaActual = 0;

      // Si no quedan categorías, termina el juego completo
      if (this.obtenerCategoriasDisponibles().length === 0) {
        this.terminado = true;
        this.perdido = false;
      }
    }

    return correcta;
  }

  reiniciar() {
    this.preguntaActual = 0;
    this.aciertos = 0;
    this.terminado = false;
    this.perdido = false;
    this.categoriaSeleccionada = '';
    this.categoriaTerminada = false;
    this.categoriasCompletadas = [];
    this.preguntasCategoria = [];
  }
}