import { Injectable } from '@angular/core';
import { Partida } from '../models/partida.model';

@Injectable({ providedIn: 'root' })
export class JuegoService {
  partidas: Partida[] = [];

  guardarPartida(partida: Partida) {
    this.partidas.push(partida);
  }

  obtenerPartidas(juego?: string) {
    return juego ? this.partidas.filter(p => p.juego === juego) : this.partidas;
  }
}