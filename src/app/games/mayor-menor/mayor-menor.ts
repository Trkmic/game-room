import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { CommonModule } from '@angular/common';
import { ResultadoMayorMenor } from '../../core/models/partida.model';

@Component({
    selector: 'app-mayor-menor',
    templateUrl: './mayor-menor.html',
    imports: [CommonModule],
    styleUrls: ['./mayor-menor.css']
})
export class MayorMenor implements OnInit {

    cartas: string[] = [];
  cartaActual: string = '';
  cartaSiguiente: string = '';
  cartasAcertadas: number = 0;
  jugadas: number = 0;
  juegoTerminado: boolean = false;

  // ranking
  resultados: ResultadoMayorMenor[] = [];
  cargandoResultados = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.inicializarCartas();
    this.nuevaRonda();
    this.cargarResultados();
  }

  inicializarCartas() {
    const palos = ['hearts', 'spades', 'clubs', 'diamonds'];
    const valores = Array.from({length: 19}, (_, i) => (i + 2).toString()); 

    this.cartas = [];
    for (let palo of palos) {
      for (let valor of valores) {
        this.cartas.push(`${valor}_${palo}`);
      }
    }
  }

  sacarCarta(): string {
    const indice = Math.floor(Math.random() * this.cartas.length);
    return this.cartas[indice];
  }

  obtenerValor(carta: string): number {
    return parseInt(carta.split('_')[0], 10);
  }

  nuevaRonda() {
    this.cartaActual = this.sacarCarta();
    this.cartaSiguiente = '';
    this.juegoTerminado = false;
  }

  async elegir(opcion: 'mayor' | 'menor') {
    if (this.juegoTerminado) return;

    this.cartaSiguiente = this.sacarCarta();
    const valorActual = this.obtenerValor(this.cartaActual);
    const valorSiguiente = this.obtenerValor(this.cartaSiguiente);

    this.jugadas++;

    if (
      (opcion === 'mayor' && valorSiguiente > valorActual) ||
      (opcion === 'menor' && valorSiguiente < valorActual)
    ) {
      this.cartasAcertadas++;
      this.cartaActual = this.cartaSiguiente;
      this.cartaSiguiente = '';
    } else {
      this.juegoTerminado = true;

      try {
        await this.supabaseService.guardarResultadoMayorMenor({
          cartas_acertadas: this.cartasAcertadas,
          fecha_play: new Date()
        });
      } catch (err) {
        console.error('Error guardando resultado mayor/menor', err);
      } finally {
        this.cargarResultados();
      }
    }
  }

  reiniciarJuego() {
    this.cartasAcertadas = 0;
    this.jugadas = 0;
    this.nuevaRonda();
  }

  async cargarResultados() {
    try {
      this.cargandoResultados = true;
      this.resultados = await this.supabaseService.obtenerResultadosMayorMenor();
    } catch (err) {
      console.error('Error cargando ranking mayor/menor', err);
      this.resultados = [];
    } finally {
      this.cargandoResultados = false;
    }
  }
}