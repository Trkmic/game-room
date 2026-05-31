import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { Encuesta } from '../models/encuesta.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _user$ = new BehaviorSubject<SupabaseUser | null>(null);
  public user$: Observable<SupabaseUser | null> = this._user$.asObservable();

  constructor() {
    this.supabase = createClient(
      'https://ikfvgopqeqffvqipnuda.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZnZnb3BxZXFmZnZxaXBudWRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDI1MDIzMCwiZXhwIjoyMDk1ODI2MjMwfQ.QKJSU8ahG88Vtuvbl9OZwxX1qQ_QdGzPPpzqXo_o7Lc'
    );

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

  getUser(): SupabaseUser | null {
    return this._user$.value;
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    this._user$.next(data.user);
    return { success: true };
  }

  async register(email: string, password: string, nombre: string, apellido: string, edad: number) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, apellido, edad } } 
    });

    if (error) return { success: false, error: error.message };

    const user = data.user;
    this._user$.next(user);

    if (user) {
      const { error: insertError } = await this.supabase
        .from('users')
        .insert({ id: user.id, nombre, apellido, edad, email });

      if (insertError) return { success: false, error: insertError.message };
    }

    return { success: true };
  }

  async logout() {
    await this.supabase.auth.signOut();
    this._user$.next(null);
  }

  async guardarResultado({
    userId,
    email,
    juego,
    puntaje,
    tiempoSegundos
  }: {
    userId: string;
    email: string;
    juego: string;
    puntaje: number;
    tiempoSegundos: number;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('resultados_juegos')
        .insert([{
          user_id: userId,
          email,
          juego,
          puntaje,
          tiempo_segundos: tiempoSegundos,
          fecha_play: new Date().toISOString()
        }]);
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }

  async guardarEncuesta(encuesta: Encuesta) {
    try {
      const { error } = await this.supabase.from('encuestas').insert([{
        user_id: encuesta.user_id,
        nombreapellido: encuesta.nombreApellido, // <- columna real
        edad: encuesta.edad,
        telefono: encuesta.telefono,
        pregunta1: encuesta.pregunta1,
        pregunta2: encuesta.pregunta2,
        pregunta3: encuesta.pregunta3,
        fecha: new Date().toISOString()
      }]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error guardando encuesta:', err);
      throw err;
    }
  }

  async obtenerResultados(juego: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('resultados_juegos')
        .select('*')
        .eq('juego', juego)
        .order('puntaje', { ascending: false })
        .order('tiempo_segundos', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async obtenerEncuestas(): Promise<Encuesta[]> {
    try {
      const { data, error } = await this.supabase
        .from('encuestas')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;

      // mapear nombreapellido → nombreApellido
      return (data || []).map((e: any) => ({
        user_id: e.user_id,
        nombreApellido: e.nombreapellido,
        edad: e.edad,
        telefono: e.telefono,
        pregunta1: e.pregunta1,
        pregunta2: e.pregunta2,
        pregunta3: e.pregunta3,
        fecha: e.fecha
      }));
    } catch (err) {
      console.error('Error obteniendo encuestas:', err);
      return [];
    }
  }

  async getEncuestaByUser(userId: string) {
    return this.supabase
      .from('encuestas')
      .select('*')
      .eq('user_id', userId);
  }




}