import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PreguntadosService } from '../../core/services/preguntados.service';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { ResultadoGeneral } from '../../core/models/partida.model';
import { FormsModule } from '@angular/forms';
import { DisplayNamePipe } from '../../core/pipes/display-name.pipe';
import { ChatService } from '../../core/services/chat.service';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preguntados',
  templateUrl: './preguntados.html',
  standalone: true,
  styleUrls: ['./preguntados.css'],
  imports: [CommonModule, FormsModule, DisplayNamePipe, AsyncPipe]
})
export class Preguntados implements OnInit, OnDestroy {

  resultados: ResultadoGeneral[] = [];
  cargando: boolean = true;
  categoriaSeleccionada: string = '';
  tiempoInicio: number = 0;
  aciertosTotales: number = 0;
  juegoInterrumpido: boolean = false;

  // Timer
  tiempoLimite: number = 10;
  tiempoRestante: number = 10;
  intervalId: any;
  perdidoPorTiempo: boolean = false;

  // Chat
  chatAbierto = false;
  newMessage = '';
  maxChars = 30;
  currentUserId = 'invitado';
  currentUserName = 'Yo';

  get messages$() {
    return this.chatService.messages$;
  }

  constructor(
    public juego: PreguntadosService,
    private supabaseService: SupabaseService,
    private chatService: ChatService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }


  async ngOnInit() {
    this.cargando = true;
    try {
      await this.juego.cargarPreguntas();
      this.resultados = await this.supabaseService.obtenerResultados('preguntados');

      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      this.currentUserId = user?.id || 'invitado';
      this.currentUserName = user?.email || 'Yo';

      await this.chatService.loadMessages();
    } catch (error) {
      this.resultados = [];
    } finally {
      this.cargando = false;
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    if (!this.juego.terminado) this.juegoInterrumpido = true;
  }

  elegirCategoria(categoria: string) {
    if (this.juego.iniciarCategoria(categoria)) {
      this.categoriaSeleccionada = categoria;
      this.tiempoInicio = Date.now();
      this.juegoInterrumpido = false;
      this.iniciarTimer();
    }
  }

  iniciarTimer() {
    this.tiempoRestante = this.tiempoLimite;
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.tiempoRestante--;
      this.cd.detectChanges();

      if (this.tiempoRestante <= 0) {
        clearInterval(this.intervalId);
        this.perderPorTiempo();
      }
    }, 1000);
  }

  perderPorTiempo() {
    // parar el timer
    clearInterval(this.intervalId);
  
    this.juego.perdido = true;
    this.juego.terminado = true;
    this.perdidoPorTiempo = true;
  
    // Guardar resultado
    const tiempoJugado = this.tiempoLimite; 
    const puntaje = this.aciertosTotales;
    const user = this.supabaseService.getUser();
  
    if (user) {
      this.supabaseService.guardarResultado({
        userId: user.id,
        email: user.email!,
        juego: 'preguntados',
        puntaje,
        tiempoSegundos: tiempoJugado
      }).finally(() => this.cargarResultados());
    }
  }

  async responder(index: number) {
    const acertó = await this.juego.responder(index);
    this.aciertosTotales += acertó ? 1 : 0;

    // Reiniciar timer en la siguiente pregunta
    if (!this.juego.terminado) this.iniciarTimer();

    if (this.juego.terminado && !this.juegoInterrumpido) {
      const tiempoJugado = Math.floor((Date.now() - this.tiempoInicio) / 1000);
      const puntaje = this.aciertosTotales;
      const user = this.supabaseService.getUser();
      if (user) {
        await this.supabaseService.guardarResultado({
          userId: user.id,
          email: user.email!,
          juego: 'preguntados',
          puntaje,
          tiempoSegundos: tiempoJugado
        });
      }
    }
  }

  reiniciar() {
    clearInterval(this.intervalId);
    this.juego.reiniciar();
    this.categoriaSeleccionada = '';
    this.tiempoInicio = 0;
    this.aciertosTotales = 0;
    this.juegoInterrumpido = false;
    this.tiempoRestante = this.tiempoLimite;
  }

  volverMenu() {
    if (!this.juego.terminado) this.juegoInterrumpido = true;
    clearInterval(this.intervalId);
    this.categoriaSeleccionada = '';
    this.chatAbierto = false;
    this.router.navigate(['/home']);
  }

  async cargarResultados() {
    try {
      this.cargando = true;
      this.resultados = await this.supabaseService.obtenerResultados('preguntados');
    } catch (error) {
      this.resultados = [];
    } finally {
      this.cargando = false;
    }
  }

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
