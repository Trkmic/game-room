import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service'; 
import { ResultadoAhorcado } from '../../core/models/partida.model';

@Component({
    selector: 'app-ahorcado',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ahorcado.html',
    styleUrls: ['./ahorcado.css']
})
export class Ahorcado implements OnInit {

    palabras: string[] = [
        'ANGULAR', 'JAVASCRIPT', 'PROGRAMACION', 'SUPABASE',
        'MONGODB', 'TYPESCRIPT', 'PYTHON', 'FIREBASE',
        'FLUTTER', 'IONIC', 'NODEJS'
    ];
    palabra: string = '';
    palabraOculta: string = '';
    letrasSeleccionadas: string[] = [];
    errores: number = 0;
    maxErrores: number = 6;
    juegoTerminado: boolean = false;
    gano: boolean = false;
    tiempoInicio: number = 0;

    resultados: ResultadoAhorcado[] = [];  
    cargando: boolean = true;      

    constructor(private supabaseService: SupabaseService) {}

    async ngOnInit() {
        try {
            this.resultados = await this.supabaseService.obtenerResultadosAhorcado();
        } catch (error) {
            console.error('Error cargando ranking Preguntados:', error);
            this.resultados = [];
        } finally {
            this.cargando = false;
        }
    }

    iniciarJuego() {
        this.palabra = this.palabras[Math.floor(Math.random() * this.palabras.length)].toUpperCase();
        this.palabraOculta = this.palabra.replace(/./g, '_ ');
        this.letrasSeleccionadas = [];
        this.errores = 0;
        this.maxErrores = 6;
        this.juegoTerminado = false;
        this.gano = false;
        this.tiempoInicio = Date.now();
    }

    seleccionarLetra(letra: string) {
        if (this.juegoTerminado) return;

        this.letrasSeleccionadas.push(letra);

        if (this.palabra.includes(letra)) {
            this.actualizarPalabraOculta();
        } else {
            this.errores++;
            if (this.errores >= this.maxErrores) {
                this.terminarJuego(false);
            }
        }

        if (!this.palabraOculta.includes('_')) {
            this.terminarJuego(true);
        }
    }

    actualizarPalabraOculta() {
        this.palabraOculta = this.palabra
            .split('')
            .map(l => this.letrasSeleccionadas.includes(l) ? l : '_')
            .join(' ');
    }

    async terminarJuego(gano: boolean) {
        this.juegoTerminado = true;
        this.gano = gano;
        
        const letrasUsadas = this.letrasSeleccionadas.length;
        const tiempoJugado = Math.floor((Date.now() - this.tiempoInicio) / 1000);

        await this.supabaseService.guardarResultado(
            'ahorcado',
            letrasUsadas,
            tiempoJugado,
            gano
        );

        this.cargarResultados();
    }

    reiniciarJuego() {
        this.iniciarJuego();
    }

    get letras(): string[] {
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    }

    async cargarResultados() {
        this.resultados = await this.supabaseService.obtenerResultadosAhorcado();
    }
}