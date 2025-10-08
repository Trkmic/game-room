import { Component, OnInit } from '@angular/core';
import { PreguntadosService } from '../../core/services/preguntados.service';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { ResultadoPreguntados } from '../../core/models/partida.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-preguntados',
    templateUrl: './preguntados.html',
    standalone: true,
    styleUrls: ['./preguntados.css'],
    imports: [CommonModule, FormsModule]
})
export class Preguntados implements OnInit {
    resultados: ResultadoPreguntados[] = [];
    cargando: boolean = true;
    categoriaSeleccionada: string = '';

    constructor(
        public juego: PreguntadosService,
        private supabaseService: SupabaseService
    ) {}

    async ngOnInit() {
        try {
            this.resultados = await this.supabaseService.obtenerResultadosPreguntados();
        } catch (error) {
            console.error('Error cargando ranking Preguntados:', error);
            this.resultados = [];
        } finally {
            this.cargando = false;
        }
    }

    elegirCategoria(categoria: string) {
        if (this.juego.iniciarCategoria(categoria)) {
            this.categoriaSeleccionada = categoria;
        }
    }

    responder(index: number) {
        this.juego.responder(index);
        
        if (this.juego.terminado) {
            const disponibles = this.juego.obtenerCategoriasDisponibles();
            this.categoriaSeleccionada = disponibles.length ? '' : this.juego.categoriaSeleccionada;
        }
    }

    reiniciar() {
        this.juego.reiniciar();
        this.categoriaSeleccionada = '';
    }
}
