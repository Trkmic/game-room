import { Injectable } from '@angular/core';
import { Pregunta } from '../models/partida.model';
import { ResultadosService } from '../services/resultados.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PreguntadosService {
    preguntas: Pregunta[] = [];
    preguntaActual = 0;
    aciertos = 0;
    terminado = false;
    perdido = false;
    categoriaSeleccionada = '';
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
        if (this.categoriasCompletadas.includes(categoria)) return false;

        this.categoriaSeleccionada = categoria;
        this.preguntas = this.preguntas.filter(p => p.categoria === categoria);
        this.preguntaActual = 0;
        return true;
    }

    obtenerCategoriasDisponibles(): string[] {
        return [...new Set(this.preguntas.map(p => p.categoria))]
            .filter(c => !this.categoriasCompletadas.includes(c));
    }

    async responder(opcionIndex: number) {
        if (this.preguntas[this.preguntaActual].correcta === opcionIndex) {
            this.aciertos++;
        } else {
            this.terminado = true;
            this.perdido = true;
            await this.resultadosService.guardarResultado('Preguntados', this.aciertos, 0);
            return;
        }
    
        this.preguntaActual++;
    
        if (this.preguntaActual >= this.preguntas.length) {
            this.categoriasCompletadas.push(this.categoriaSeleccionada);
            const disponibles = this.obtenerCategoriasDisponibles();
    
            if (disponibles.length === 0) {
                this.terminado = true;
                this.perdido = false;
                await this.resultadosService.guardarResultado('Preguntados', this.aciertos, 0);
            } else {
                const siguiente = disponibles[Math.floor(Math.random() * disponibles.length)];
                this.iniciarCategoria(siguiente);
            }
        }
    }

    reiniciar() {
        this.preguntaActual = 0;
        this.aciertos = 0;
        this.terminado = false;
        this.perdido = false;
        this.categoriaSeleccionada = '';
        this.categoriasCompletadas = [];
    }
}