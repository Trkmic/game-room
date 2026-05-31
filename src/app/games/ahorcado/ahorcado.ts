import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { DisplayNamePipe } from '../../core/pipes/display-name.pipe';
import { ResultadoGeneral } from '../../core/models/partida.model';
import { ChatService } from '../../core/services/chat.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayNamePipe, AsyncPipe],
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.css']
})
export class Ahorcado implements OnInit {

  palabras: string[] = ['ANGULAR', 'JAVASCRIPT', 'PROGRAMACION', 'SUPABASE', 'MONGODB', 
    'TYPESCRIPT', 'PYTHON', 'FIREBASE', 'FLUTTER', 'IONIC', 'NODEJS'];
  palabra: string = '';
  palabraOculta: string = '';
  letrasSeleccionadas: string[] = [];
  errores: number = 0;
  maxErrores: number = 6;
  juegoTerminado: boolean = false;
  gano: boolean = false;
  tiempoInicio: number = 0;
  resultados: ResultadoGeneral[] = [];
  cargando: boolean = true;

  chatAbierto = false;
  newMessage = '';
  maxChars = 30;
  currentUserId = 'invitado';
  currentUserName = 'Yo';
  juegoCompletado = false; // 🔹 Nuevo: saber si terminó el juego realmente
  
  tiempoLimite: number = 30; // 30 segundos por partida
  tiempoRestante: number = this.tiempoLimite;
  intervalId: any = null;

  get messages$() {
    return this.chatService.messages$;
  }

  constructor(
    private supabaseService: SupabaseService,
    private chatService: ChatService,
    private router: Router,
    private cd: ChangeDetectorRef  
  ) {}

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  async ngOnInit() {
    this.iniciarJuego();
    await this.cargarResultados();

    try {
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      this.currentUserId = user?.id || 'invitado';
      this.currentUserName = user?.email || 'Yo';
    } catch {
      this.currentUserId = 'invitado';
      this.currentUserName = 'Yo';
    }

    await this.chatService.loadMessages();
  }

  iniciarJuego() {
    this.palabra = this.palabras[Math.floor(Math.random() * this.palabras.length)].toUpperCase();
    this.palabraOculta = this.palabra.replace(/./g, '_ ');
    this.letrasSeleccionadas = [];
    this.errores = 0;
    this.juegoTerminado = false;
    this.gano = false;
    this.juegoCompletado = false;
    this.tiempoInicio = Date.now();
  
    // 🔹 Reiniciar timer
    this.tiempoRestante = this.tiempoLimite;
    if (this.intervalId) clearInterval(this.intervalId);
  
    this.intervalId = setInterval(() => {
      this.tiempoRestante--;
  
      // 🔹 Forzar a actualizar la vista en cada tick
      this.cd.detectChanges();
  
      if (this.tiempoRestante <= 0) {
        this.terminarJuego(false);
      }
    }, 1000);
  }

  seleccionarLetra(letra: string) {
    if (this.juegoTerminado) return;
    this.letrasSeleccionadas.push(letra);

    if (this.palabra.includes(letra)) {
      this.actualizarPalabraOculta();
    } else {
      this.errores++;
      if (this.errores >= this.maxErrores) this.terminarJuego(false);
    }

    if (!this.palabraOculta.includes('_')) this.terminarJuego(true);
  }

  actualizarPalabraOculta() {
    this.palabraOculta = this.palabra
      .split('')
      .map(l => this.letrasSeleccionadas.includes(l) ? l : '_')
      .join(' ');
  }

async terminarJuego(gano: boolean) {
    this.juegoTerminado = true;
    this.gano = gano;
    this.juegoCompletado = true;

    // 🔹 Detener timer
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const user = this.supabaseService.getUser();
    if (!user) return;

    const tiempoJugado = this.tiempoLimite - this.tiempoRestante;
    const puntaje = gano ? Math.max(100 - this.errores * 10, 0) : 0;

    await this.supabaseService.guardarResultado({
      userId: user.id,
      email: user.email!,
      juego: 'ahorcado',
      puntaje: puntaje,
      tiempoSegundos: tiempoJugado
    });

    await this.cargarResultados();
  }

  reiniciarJuego() {
    this.iniciarJuego();
  }

  volverAlMenu() {
    this.router.navigate(['/home']);
  }

  get letras(): string[] {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  }

  get puntajeActual(): number {
    return Math.max(100 - this.errores * 10, 0);
  }

  async cargarResultados() {
    try {
      this.cargando = true;
      this.resultados = await this.supabaseService.obtenerResultados('ahorcado');
    } catch {
      this.resultados = [];
    } finally {
      this.cargando = false;
      this.cd.detectChanges();
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