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
    this.supabase = createClient('https://nenbbbgljgtsuzktwjze.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbmJiYmdsamd0c3V6a3R3anplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzkzMDcsImV4cCI6MjA3NDgxNTMwN30.FI3JPhrqJ12Lg38nyRcmPDILWPebdjv7aUARj_x8qxw');

    
    // Cargar sesión al iniciar
    this.supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) this._user$.next(data.session.user);
    });

    // Escuchar cambios de auth
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
    // 1️⃣ Crear el usuario en auth
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, apellido, edad } } // esto solo va a auth.user.user_metadata
    });
  
    if (error) return { success: false, error: error.message };
  
    const user = data.user;
    this._user$.next(user);
  
    // 2️⃣ Insertar los datos en tu tabla users
    if (user) {
      const { error: insertError } = await this.supabase
        .from('users')
        .insert({
          id: user.id, // clave primaria, misma que auth
          nombre,
          apellido,
          edad,
          email
        });
  
      if (insertError) {
        console.error('Error insertando en tabla users:', insertError);
        return { success: false, error: insertError.message };
      }
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
      .insert([
        {
            user_id: userId,           // id de autenticación
            email: email,         // columna email
            juego: juego,
            puntaje: puntaje,
            tiempo_segundos: tiempoSegundos, // mapeo TS -> DB
            fecha_play: new Date().toISOString()
        }
      ]);
  
    if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error guardando resultado:', err);
      throw err;
    }
  }


  async guardarEncuesta(encuesta: Encuesta) {
    try {
      const { error } = await this.supabase.from('encuestas').insert([{
        ...encuesta,
        fecha: new Date().toISOString()
      }]);
      if (error) throw error;
    } catch (error) {
      console.error('Error guardando encuesta:', error);
    }
  }

  async obtenerResultados(juego: string) {
    try {
      const { data, error } = await this.supabase
        .from('resultados_juegos')
        .select('*')
        .eq('juego', juego)
        .order('puntaje', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo resultados:', error);
      return [];
    }
  }
  
  async obtenerEncuestas(): Promise<Encuesta[]> {
    try {
      const { data, error } = await this.supabase.from('encuestas').select('*').order('fecha', { ascending: false });
      if (error) throw error;
    return data as Encuesta[];
    } catch (error) {
      console.error('Error obteniendo encuestas:', error);
      return [];
    }
  }
}