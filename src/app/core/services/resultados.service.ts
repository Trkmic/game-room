import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResultadosService {
  constructor(private supabaseService: SupabaseService) {}

  // Guardar resultado genérico
  async guardarResultado(juego: string, puntaje: number, tiempoSegundos: number) {
    const user = this.supabaseService.getUser();
    if (!user) {
      console.warn('No hay usuario logueado, no se puede guardar resultado');
      return;
    }

    try {
      await this.supabaseService.client
        .from('resultados_juegos')
        .insert([{
          email: user.email,
          juego,
          puntaje,
          tiempo_segundos: tiempoSegundos,
          fecha_play: new Date().toISOString()
        }]);
    } catch (error) {
    }
  }

  getResultados(juego: string) {
    return from(
      this.supabaseService.client
        .from('resultados_juegos')
        .select('*')
        .eq('juego', juego)
        .order('puntaje', { ascending: false })
        .order('tiempo_segundos', { ascending: true })
        .limit(10)
    ).pipe(map(res => res.data));
  }

  getTodosResultados() {
    return from(
      this.supabaseService.client
        .from('resultados_juegos')
        .select('*')
        .order('fecha_play', { ascending: false })
    ).pipe(map(res => res.data));
  }
}