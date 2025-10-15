import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class FastClickService {
  private JUEGO = 'JuegoPropio';

  constructor(private supabaseService: SupabaseService) {}

  async guardarResultado(puntaje: number, tiempoSegundos: number): Promise<void> {
    const user = this.supabaseService.getUser();
    if (!user) {
      console.warn('No hay usuario logueado, no se puede guardar el resultado');
      return;
    }

    try {
      await this.supabaseService.client.from('resultados_juegos').insert([{
        user_id: user.id,
        email: user.email,
        juego: this.JUEGO,
        puntaje,
        tiempo_segundos: tiempoSegundos,
        fecha_play: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Error guardando resultado:', err);
    }
  }

  async obtenerRanking(): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('resultados_juegos')
        .select('*')
        .eq('juego', this.JUEGO)
        .order('puntaje', { ascending: false })
        .order('tiempo_segundos', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error obteniendo ranking:', err);
      return [];
    }
  }
}