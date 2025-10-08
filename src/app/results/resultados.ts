import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { SupabaseService } from '../core/services/supabase.service';
import { ResultadoAhorcado, ResultadoPreguntados, ResultadoFastClick, ResultadoMayorMenor } from '../core/models/partida.model';
import { Encuesta} from '../core/models/encuesta.model';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.css']
})
export class Resultados implements OnInit {
  resultadosAhorcado: ResultadoAhorcado[] = [];
  resultadosPreguntados: ResultadoPreguntados[] = [];
  resultadosFastClick: ResultadoFastClick[] = [];
  resultadosMayorMenor: ResultadoMayorMenor[] = [];
  encuestas: Encuesta[] = [];

  cargandoAhorcado = false;
  cargandoPreguntados = false;
  cargandoFastClick = false;
  cargandoMayorMenor = false;
  cargandoEncuestas = false;

  selectedSection: string | null = null;
  isAdmin = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    const user = this.supabaseService.getUser();
    this.isAdmin = !!user && user.email === 'admin@test.com';
  }

  async mostrarSeccion(seccion: string) {
    this.selectedSection = seccion;

    switch (seccion) {
      case 'ahorcado':
        if (this.resultadosAhorcado.length === 0) await this.cargarAhorcado();
        break;
      case 'preguntados':
        if (this.resultadosPreguntados.length === 0) await this.cargarPreguntados();
        break;
      case 'fastclick':
        if (this.resultadosFastClick.length === 0) await this.cargarFastClick();
        break;
      case 'mayormenor':
        if (this.resultadosMayorMenor.length === 0) await this.cargarMayorMenor();
        break;
      case 'encuestas':
        if (this.encuestas.length === 0 && this.isAdmin) await this.cargarEncuestas();
        break;
    }
  }

  async cargarAhorcado() {
    this.cargandoAhorcado = true;
    try {
      this.resultadosAhorcado = await this.supabaseService.obtenerResultadosAhorcado();
    } finally {
      this.cargandoAhorcado = false;
    }
  }

  async cargarPreguntados() {
    this.cargandoPreguntados = true;
    try {
      this.resultadosPreguntados = await this.supabaseService.obtenerResultadosPreguntados();
    } finally {
      this.cargandoPreguntados = false;
    }
  }

  async cargarFastClick() {
    this.cargandoFastClick = true;
    try {
      this.resultadosFastClick = await this.supabaseService.obtenerResultadosFastClick();
    } finally {
      this.cargandoFastClick = false;
    }
  }

  async cargarMayorMenor() {
    this.cargandoMayorMenor = true;
    try {
      this.resultadosMayorMenor = await this.supabaseService.obtenerResultadosMayorMenor();
    } finally {
      this.cargandoMayorMenor = false;
    }
  }

  async cargarEncuestas() {
    this.cargandoEncuestas = true;
    try {
      this.encuestas = await this.supabaseService.obtenerEncuestas();
    } finally {
      this.cargandoEncuestas = false;
    }
  }
}
