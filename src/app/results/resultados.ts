import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../core/services/supabase.service';
import { ResultadoGeneral } from '../core/models/partida.model';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.css']
})
export class Resultados implements OnInit {
  resultados: ResultadoGeneral[] = [];
  cargando = false;

  selectedJuego: 'ahorcado' | 'preguntados' | 'fastclick' | 'mayormenor' | null = null;

  isAdmin = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    const user = this.supabaseService.getUser();
    this.isAdmin = !!user && user.email === 'admin@test.com';
  }

  async mostrarJuego(juego: 'ahorcado' | 'preguntados' | 'fastclick' | 'mayormenor') {
    this.selectedJuego = juego;
    await this.cargarResultados();
  }

  async cargarResultados() {
    if (!this.selectedJuego) return;
    this.cargando = true;
    try {
      this.resultados = await this.supabaseService.obtenerResultados(this.selectedJuego);
    } catch (error) {
      console.error('Error cargando resultados:', error);
      this.resultados = [];
    } finally {
      this.cargando = false;
    }
  }
}