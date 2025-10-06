import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ResultadoFastClick } from '../models/partida.model';

@Injectable({
    providedIn: 'root'
})
export class FastClickService {
    constructor(private supabaseService: SupabaseService) {}

    async guardarResultado(puntaje: number, tiempoSegundos: number): Promise<void> {
        const user = this.supabaseService.getUser();
        if (!user) {
            console.warn('No hay usuario logueado, no se puede guardar el resultado de Fast Click');
            return;
        }
        
        try {
            await this.supabaseService.client
            .from('results_juego_propio')
            .insert([{
              user_id: user.id,                  // usuario que juega
              puntaje,                           // puntaje de la partida
              tiempo_segundos: tiempoSegundos,   // duración del juego
              fecha_play: new Date().toISOString() // timestamp único
            }]);
        
            console.log('Resultado de Fast Click guardado correctamente');
            } catch (error) {
            console.error('Error al guardar resultado de Fast Click:', error);
            }
        }
}