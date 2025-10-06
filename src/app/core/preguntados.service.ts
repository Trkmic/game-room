import { Injectable } from '@angular/core';
import { Pregunta, ResultadoPreguntados } from '../models/partida.model';
import { SupabaseService } from '../core/supabase.service';

export const PREGUNTAS: Pregunta[] = [
    // Categoría: Historia
    { categoria: 'Historia', pregunta: '¿Quién descubrió América?', opciones: ['Colón','Magallanes','Cook','Vespucci'], correcta: 0 },
    { categoria: 'Historia', pregunta: '¿En qué año terminó la Segunda Guerra Mundial?', opciones: ['1945','1939','1918','1963'], correcta: 0 },
    { categoria: 'Historia', pregunta: '¿Quién fue Napoleón?', opciones: ['Rey','General','Filósofo','Escritor'], correcta: 1 },
    { categoria: 'Historia', pregunta: 'Imperio romano cayó en el año?', opciones: ['476','410','500','395'], correcta: 0 },
    { categoria: 'Historia', pregunta: '¿Quién fue el primer presidente de EE.UU.?', opciones: ['Lincoln','Washington','Adams','Jefferson'], correcta: 1 },

    // Categoría: Ciencia
    { categoria: 'Ciencia', pregunta: 'El agua es?', opciones: ['H2O','CO2','O2','H2'], correcta: 0 },
    { categoria: 'Ciencia', pregunta: 'Planeta más cercano al sol?', opciones: ['Venus','Mercurio','Tierra','Marte'], correcta: 1 },
    { categoria: 'Ciencia', pregunta: '¿Qué es la gravedad?', opciones: ['Fuerza','Energía','Masa','Velocidad'], correcta: 0 },
    { categoria: 'Ciencia', pregunta: 'Número de planetas en el sistema solar?', opciones: ['7','8','9','10'], correcta: 1 },
    { categoria: 'Ciencia', pregunta: 'La luz viaja a?', opciones: ['300,000 km/s','150,000 km/s','1,000 km/s','30,000 km/s'], correcta: 0 },

    // Categoría: Geografía
    { categoria: 'Geografía', pregunta: 'Capital de Francia?', opciones: ['Madrid','París','Berlín','Lisboa'], correcta: 1 },
    { categoria: 'Geografía', pregunta: 'Río más largo del mundo?', opciones: ['Nilo','Amazonas','Yangtsé','Misisipi'], correcta: 0 },
    { categoria: 'Geografía', pregunta: 'País con más habitantes?', opciones: ['India','EE.UU.','China','Brasil'], correcta: 2 },
    { categoria: 'Geografía', pregunta: 'Continente más grande?', opciones: ['África','Asia','América','Europa'], correcta: 1 },
    { categoria: 'Geografía', pregunta: 'Montaña más alta?', opciones: ['K2','Everest','Denali','Mont Blanc'], correcta: 1 },

    // Categoría: Arte
    { categoria: 'Arte', pregunta: 'Autor de La Mona Lisa?', opciones: ['Van Gogh','Da Vinci','Picasso','Rembrandt'], correcta: 1 },
    { categoria: 'Arte', pregunta: 'Obra "La noche estrellada"?', opciones: ['Van Gogh','Picasso','Da Vinci','Monet'], correcta: 0 },
    { categoria: 'Arte', pregunta: 'Movimiento artístico "Impresionismo"?', opciones: ['Siglo XIX','Siglo XVIII','Siglo XX','Siglo XVII'], correcta: 0 },
    { categoria: 'Arte', pregunta: '¿Quién pintó "El Guernica"?', opciones: ['Picasso','Dalí','Goya','Velázquez'], correcta: 0 },
    { categoria: 'Arte', pregunta: 'Autor de "El David"?', opciones: ['Miguel Ángel','Donatello','Rafael','Leonardo'], correcta: 0 }
];

@Injectable({ providedIn: 'root' })
export class PreguntadosService {
    preguntas: Pregunta[] = PREGUNTAS;
    preguntaActual = 0;
    aciertos = 0;
    terminado = false;
    perdido = false;
    categoriaSeleccionada = '';
    categoriasCompletadas: string[] = [];

    constructor(private supabaseService: SupabaseService) {}

    iniciarCategoria(categoria: string): boolean {
        if (this.categoriasCompletadas.includes(categoria)) return false;

        this.categoriaSeleccionada = categoria;
        this.preguntas = PREGUNTAS.filter(p => p.categoria === categoria);
        this.preguntaActual = 0;
        return true;
    }

    obtenerCategoriasDisponibles(): string[] {
        return [...new Set(PREGUNTAS.map(p => p.categoria))]
            .filter(c => !this.categoriasCompletadas.includes(c));
    }

    async responder(opcionIndex: number) {
        if (this.preguntas[this.preguntaActual].correcta === opcionIndex) {
            this.aciertos++;
        } else {
            this.terminado = true;
            this.perdido = true;
            await this.supabaseService.guardarResultadoPreguntados(this.aciertos);
            return;
        }
    
        this.preguntaActual++;
    
        if (this.preguntaActual >= this.preguntas.length) {
            this.categoriasCompletadas.push(this.categoriaSeleccionada);
            const disponibles = this.obtenerCategoriasDisponibles();
    
            if (disponibles.length === 0) {
                this.terminado = true;
                this.perdido = false;
                await this.supabaseService.guardarResultadoPreguntados(this.aciertos);
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