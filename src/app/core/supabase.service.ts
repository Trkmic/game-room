import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { ResultadoAhorcado } from '../models/partida.model';
import { ResultadoMayorMenor } from '../models/partida.model';
import { ResultadoPreguntados } from '../models/partida.model';
import { ResultadoFastClick } from '../models/partida.model';
import { Encuesta } from '../models/encuesta.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _user$ = new BehaviorSubject<SupabaseUser | null>(null);
  public user$: Observable<SupabaseUser | null> = this._user$.asObservable();

  constructor() {
    this.supabase = createClient('https://nenbbbgljgtsuzktwjze.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbmJiYmdsamd0c3V6a3R3anplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzkzMDcsImV4cCI6MjA3NDgxNTMwN30.FI3JPhrqJ12Lg38nyRcmPDILWPebdjv7aUARj_x8qxw');

    
    this.supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) this._user$.next(data.session.user);
    });

    this.supabase.auth.onAuthStateChange((_, session) => {
      this._user$.next(session?.user || null);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
  
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    this._user$.next(data.user);
    return { success: true };
  }

  async register(email: string, password: string, userData: any): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    });
    if (error) return { success: false, error: error.message };
    this._user$.next(data.user);
    return { success: true };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this._user$.next(null);
  }

  isLoggedIn(): boolean {
    return this._user$.value !== null;
  }

  getUser(): SupabaseUser | null {
    return this._user$.value;
  }

  getRole(): string | undefined {
    return this._user$.value?.user_metadata?.['role'];
  }
  
  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  async guardarResultado(
    juego: string, 
    letrasSeleccionadas: number, 
    tiempoSegundos: number, 
    gano: boolean
  ) {
    const user = this.getUser();
    if (!user) {
      console.warn('No hay usuario logueado, no se puede guardar resultado');
      return;
    }
  
    const { data, error } = await this.supabase
      .from('results_ahorcado') // nombre exacto de la tabla
      .insert([{
        user_id: user.id,             // uuid del usuario logueado
        tiempo_segundos: tiempoSegundos,
        letras_seleccionadas: letrasSeleccionadas,
        fecha_play: new Date().toISOString(),
        gano: gano
      }]);
  
    if (error) {
      console.error('Error guardando resultado:', error);
    }
    return data;
  }

  async guardarResultadoMayorMenor(resultado: { cartas_acertadas: number, fecha_play: Date }) {
    const user = (await this.supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No hay usuario logueado');
  
    const { error } = await this.supabase
      .from('results_mayor_menor')
      .insert([
        {
          user_id: user.id,
          cartas_acertadas: resultado.cartas_acertadas,
          fecha_play: resultado.fecha_play
        }
      ]);
  
    if (error) throw error;
  }

  async obtenerResultadosMayorMenor(): Promise<ResultadoMayorMenor[]> {
    const { data, error } = await this.supabase
      .from('results_mayor_menor')
      .select('*')
      .order('cartas_acertadas', { ascending: false }) // mejor primero
      .order('fecha_play', { ascending: true })
      .limit(10); 

    if (error) {
      console.error('Error al obtener resultados mayor/menor:', error);
      return [];
    }
    return data as ResultadoMayorMenor[];
  }
  
  // supabase.service.ts
  async guardarEncuesta(datos: any) {
    try {
      const user = this.getUser();
      if (!user) throw new Error('No hay usuario logueado');
  
      // Convertimos el array a un formato compatible con Postgres
      const pregunta2Array = datos.pregunta2.map((x: string) => x);
  
      const { data, error } = await this.supabase
        .from('encuestas')
        .insert([{
          user_id: user.id,             
          nombreapellido: datos.nombreapellido,
          edad: datos.edad,
          telefono: datos.telefono,
          pregunta1: datos.pregunta1,
          pregunta2: pregunta2Array,   
          pregunta3: datos.pregunta3,
          fecha: datos.fecha
        }]);
  
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error guardando encuesta:', error);
      throw error;
    }
  }
  
  async obtenerEncuestas(): Promise<Encuesta[]> {
    const { data, error } = await this.supabase
      .from('encuestas')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(10);
  
    if (error) {
      console.error('Error al obtener encuestas:', error);
      return [];
    }
  
    return data as Encuesta[];
  }

  async obtenerResultadosAhorcado(): Promise<ResultadoAhorcado[]> {
    const { data, error } = await this.supabase
      .from('results_ahorcado')
      .select('*')
      .order('gano', { ascending: false })
      .order('letras_seleccionadas', { ascending: false })
      .order('tiempo_segundos', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error al obtener resultados:', error);
      return [];
    }
  
    return data as ResultadoAhorcado[];
  }

  // Guarda el resultado de Preguntados
  async guardarResultadoPreguntados(preguntasAcertadas: number) {
    const user = this.getUser();
    if (!user) {
      console.warn('No hay usuario logueado, no se puede guardar resultado');
      return;
    }

    const { error } = await this.supabase
      .from('results_preguntados') // 👈 nombre de la tabla en Supabase
      .insert([{
        user_id: user.id,
        preguntas_acertadas: preguntasAcertadas,
        fecha_play: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error guardando resultado de Preguntados:', error);
    }
  }

  // Obtiene el Top 10 de Preguntados
  async obtenerResultadosPreguntados(): Promise<ResultadoPreguntados[]> {
    const { data, error } = await this.supabase
      .from('results_preguntados')
      .select('*')
      .order('preguntas_acertadas', { ascending: false })
      .order('fecha_play', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error al obtener resultados de Preguntados:', error);
      return [];
    }

    return data as ResultadoPreguntados[];
  }

  async obtenerResultadosFastClick(): Promise<ResultadoFastClick[]> {
    const { data, error } = await this.supabase
      .from('results_juego_propio')
      .select('*')
      .order('puntaje', { ascending: false })
      .order('tiempo_segundos', { ascending: true })
      .order('fecha_play', { ascending: true })
      .limit(10);
  
    if (error) {
      console.error('Error al obtener resultados FastClick:', error);
      return [];
    }
  
    return data as ResultadoFastClick[];
  }
}
