import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class FastClickService {
    private JUEGO = 'JuegoPropio';

    constructor(private supabaseService: SupabaseService) {}

    async guardarResultado(puntaje: number, tiempoSegundos: number): Promise<void> {
        const user = this.supabaseService.getUser();
        if (!user) {
        console.warn('No hay usuario logueado, no se puede guardar el resultado de JuegoPropio');
            return;
        }
        
        try {
            await this.supabaseService.client
          .from('resultados_juegos')
            .insert([{
            email: user.email,           // Guardamos el email
            juego: this.JUEGO,           // Nombre del juego
                puntaje,                           
                tiempo_segundos: tiempoSegundos,   
                fecha_play: new Date().toISOString() 
            }]);
        
        console.log('Resultado de JuegoPropio guardado correctamente');
            } catch (error) {
        console.error('Error al guardar resultado de JuegoPropio:', error);
      }
    }
  
    async obtenerRanking(): Promise<any[]> {
      try {
        const { data, error } = await this.supabaseService.client
          .from('results')
          .select('*')
          .eq('juego', this.JUEGO)
          .order('puntaje', { ascending: false })
          .order('tiempo_segundos', { ascending: true })
          .limit(10);
  
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error obteniendo ranking JuegoPropio:', error);
        return [];
            }
        }
}