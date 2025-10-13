import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../core/services/supabase.service';
import { ResultadoGeneral } from '../core/models/partida.model';
import { Encuesta } from '../core/models/encuesta.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.css']
})
export class Resultados implements OnInit {
  resultados: ResultadoGeneral[] = [];
  encuestas: Encuesta[] = [];
  cargando = false;
  cargandoEncuestas = false;
  selectedJuego: 'ahorcado' | 'preguntados' | 'fastclick' | 'mayormenor' | 'encuestas' | null = null;
  isAdmin = false;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,  
    private router: Router
  ) {}

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  ngOnInit() {
    const user = this.supabaseService.getUser();
    this.isAdmin = !!user && user.email === 'admin@test.com';
  }

  async mostrarJuego(juego: 'ahorcado' | 'preguntados' | 'fastclick' | 'mayormenor') {
    this.selectedJuego = juego;
    this.resultados = [];
    await this.cargarResultados(juego);
    this.cdr.detectChanges(); // <--- fuerza actualización de la vista
  }

  async mostrarEncuestas() {
    this.selectedJuego = 'encuestas';
    this.encuestas = [];
    await this.cargarEncuestas();
    this.cdr.detectChanges(); // <--- fuerza actualización de la vista
  }

  async cargarResultados(juego: 'ahorcado' | 'preguntados' | 'fastclick' | 'mayormenor') {
    this.cargando = true;
    this.cdr.detectChanges();
  
    // Mapeo para Supabase
    let juegoDB = juego === 'mayormenor' ? 'mayor-menor' : juego;
  
    try {
      this.resultados = await this.supabaseService.obtenerResultados(juegoDB);
    } catch (error) {
      console.error('Error cargando resultados:', error);
      this.resultados = [];
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async cargarEncuestas() {
    this.cargandoEncuestas = true;
    this.cdr.detectChanges(); // <--- mostrar loading inmediatamente
    try {
      this.encuestas = await this.supabaseService.obtenerEncuestas();
    } catch (error) {
      console.error('Error cargando encuestas:', error);
      this.encuestas = [];
    } finally {
      this.cargandoEncuestas = false;
      this.cdr.detectChanges(); // <--- actualizar la vista cuando termina
    }
  }

  get nombreJuego(): string {
    switch (this.selectedJuego) {
      case 'ahorcado': return 'Ahorcado';
      case 'preguntados': return 'Preguntados';
      case 'fastclick': return 'Fast Click';
      case 'mayormenor': return 'Mayor o Menor';
      default: return '';
    }
  }
}