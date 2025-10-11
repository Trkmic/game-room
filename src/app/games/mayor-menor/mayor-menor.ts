import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResultadoGeneral } from '../../core/models/partida.model';
import { DisplayNamePipe } from '../../core/pipes/display-name.pipe';
import { ChatService } from '../../core/services/chat.service';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayNamePipe, AsyncPipe],
    templateUrl: './mayor-menor.html',
    styleUrls: ['./mayor-menor.css']
})
export class MayorMenor implements OnInit {

  // ---------------------- Juego ----------------------
    cartas: string[] = [];
  cartaActual: string = '';
  cartaSiguiente: string = '';
  cartasAcertadas: number = 0;
  jugadas: number = 0;
  juegoTerminado: boolean = false;
  tiempoInicio: number = 0;

  // ---------------------- Ranking ----------------------
  resultados: ResultadoGeneral[] = [];
  cargandoResultados = false;

  // ---------------------- Chat ----------------------
  chatAbierto = false;
  newMessage = '';
  maxChars = 30;
  currentUserId = 'invitado';
  currentUserName = 'Yo';

  // Observable de mensajes
  get messages$() {
    return this.chatService.messages$;
  }

  constructor(private supabaseService: SupabaseService,
              private chatService: ChatService) {}

  async ngOnInit() {
    this.inicializarCartas();
    this.nuevaRonda();
    this.cargarResultados();

    // Inicializar usuario para chat
    try {
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      this.currentUserId = user?.id || 'invitado';
      this.currentUserName = user?.email || 'Yo';
    } catch {
      this.currentUserId = 'invitado';
      this.currentUserName = 'Yo';
    }

    // Cargar mensajes del chat
    await this.chatService.loadMessages();
  }

  // ---------------------- Juego ----------------------
  inicializarCartas() {
    const palos = ['hearts', 'spades', 'clubs', 'diamonds'];
    const valores = Array.from({ length: 19 }, (_, i) => (i + 2).toString());
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
    this.cartasAcertadas = 0;
    this.jugadas = 0;
    this.tiempoInicio = Date.now();
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
      const tiempoJugado = Math.floor((Date.now() - this.tiempoInicio) / 1000);
      const puntaje = this.cartasAcertadas;

      const user = this.supabaseService.getUser();
      if (!user) {
        console.error('Usuario no logueado');
        return;
      }

      try {
        await this.supabaseService.guardarResultado({
          userId: user.id,
          email: user.email!,
          juego: 'mayor-menor',
          puntaje,
          tiempoSegundos: tiempoJugado
        });
      } catch (err) {
        console.error('Error guardando resultado mayor/menor', err);
      } finally {
        this.cargarResultados();
      }
    }
  }

  reiniciarJuego() {
    this.nuevaRonda();
  }

  async cargarResultados() {
    try {
      this.cargandoResultados = true;
      this.resultados = await this.supabaseService.obtenerResultados('mayor-menor');
    } catch (err) {
      this.resultados = [];
    } finally {
      this.cargandoResultados = false;
    }
  }

  // ---------------------- Chat ----------------------
  async sendMessage() {
    if (!this.newMessage.trim()) return;

    await this.chatService.sendMessage(
      this.currentUserId,
      this.newMessage,
      this.currentUserName
    );

    this.newMessage = '';
  }
}