import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { from, map } from 'rxjs';

const supabaseUrl = 'https://nenbbbgljgtsuzktwjze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbmJiYmdsamd0c3V6a3R3anplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzkzMDcsImV4cCI6MjA3NDgxNTMwN30.FI3JPhrqJ12Lg38nyRcmPDILWPebdjv7aUARj_x8qxw';
const supabase = createClient(supabaseUrl, supabaseKey);

@Injectable({ providedIn: 'root' })
export class ResultadosService {

  getJuegoPropio() {
    return from(
      supabase.from('results_juego_propio').select('*')
    ).pipe(
      map(res => res.data) // <--- Muy importante, solo el array
    );
  }

  getPreguntados() {
    return from(
      supabase.from('results_preguntados').select('*')
    ).pipe(map(res => res.data));
  }

  getMayorMenor() {
    return from(
      supabase.from('results_mayor_menor').select('*')
    ).pipe(map(res => res.data));
  }

  getAhorcado() {
    return from(
      supabase.from('results_ahorcado').select('*')
    ).pipe(map(res => res.data));
  }
}