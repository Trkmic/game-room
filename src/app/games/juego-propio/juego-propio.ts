import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { ResultadoGeneral } from '../../core/models/partida.model';
import { DisplayNamePipe } from '../../core/pipes/display-name.pipe';
import { AsyncPipe } from '@angular/common';
import { ChatService } from '../../core/services/chat.service';
import { Router } from '@angular/router';

type Category = 'Colores' | 'Animales' | 'Frutas';

@Component({
  selector: 'juego-propio',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayNamePipe, AsyncPipe],
  templateUrl: './juego-propio.html',
  styleUrls: ['./juego-propio.css']
})
export class JuegoPropio implements OnInit, OnDestroy {

  // ---------------------- Juego ----------------------
  score = 0;
  timeLeft = 30;
  gameActive = false;
  gameFinished = false;
  gameOverMessage = '';
  level = 1;
  combo = 0;
  nextLevelScore = 50;
  baseItemTime = 1500;
  tiempoInicio: number = 0;
  intervalId: any;
  itemTimeout: any;
  itemInterval: any;
  itemTimeLeft = 0;
  maxItemTime = 0;
  juegoCompletado = false;

  categories: Record<Category, string[]> = {
    Colores: ['Rojo', 'Verde', 'Azul', 'Amarillo', 'Morado'],
    Animales: ['Perro', 'Gato', 'Elefante', 'Tigre', 'Mono'],
    Frutas: ['Manzana', 'Banana', 'Naranja', 'Uva', 'Pera']
  };
  currentCategory: Category = 'Colores';
  currentItem = '';
  options: string[] = [];

  // ---------------------- Ranking ----------------------
  resultados: ResultadoGeneral[] = [];
  cargando: boolean = true;

  // ---------------------- Chat ----------------------
  chatAbierto = false;
  newMessage = '';
  maxChars = 30;
  currentUserId = 'invitado';
  currentUserName = 'Yo';

  // ---------------------- Instrucciones ----------------------
  instruccionesAbiertas: boolean = false;

  get messages$() {
    return this.chatService.messages$;
  }

  constructor(
    private supabaseService: SupabaseService,
    private chatService: ChatService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.options = this.categories[this.currentCategory];
  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  async ngOnInit(): Promise<void> {
    this.cargarRanking();

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

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearTimeout(this.itemTimeout);
    clearInterval(this.itemInterval);

    if (!this.juegoCompletado && this.gameActive && !this.gameFinished) {
      this.gameActive = false;
    }
  }

  // ---------------------- Juego ----------------------
  startGame(): void {
    this.score = 0;
    this.level = 1;
    this.combo = 0;
    this.timeLeft = 30;
    this.gameActive = true;
    this.gameFinished = false;
    this.juegoCompletado = false;
    this.gameOverMessage = '';
    this.tiempoInicio = Date.now();

    this.selectCategory();
    this.nextItem();

    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.timeLeft--;
      this.cd.detectChanges();
      if (this.timeLeft <= 0) this.endGame('⏰ ¡Se acabó el tiempo!');
    }, 1000);
  }

  selectCategory(): void {
    const keys = Object.keys(this.categories) as Category[];
    this.currentCategory = keys[Math.floor(Math.random() * keys.length)];
    this.options = this.categories[this.currentCategory];
  }

  nextItem(): void {
    if (!this.gameActive) return;

    const index = Math.floor(Math.random() * this.options.length);
    this.currentItem = this.options[index];

    this.maxItemTime = Math.max(0.4, (this.baseItemTime - (this.level - 1) * 200) / 1000);
    this.itemTimeLeft = this.maxItemTime;

    clearTimeout(this.itemTimeout);
    clearInterval(this.itemInterval);

    this.itemTimeout = setTimeout(() => {
      if (this.gameActive) {
        this.combo = 0;
        this.endGame('⚠️ ¡Tiempo agotado!');
      }
    }, this.maxItemTime * 1000);

    this.itemInterval = setInterval(() => {
      this.itemTimeLeft = Math.max(0, this.itemTimeLeft - 0.1);
      this.cd.detectChanges();
      if (this.itemTimeLeft <= 0) clearInterval(this.itemInterval);
    }, 100);
  }

  clickOption(option: string): void {
    if (!this.gameActive) return;

    clearTimeout(this.itemTimeout);
    clearInterval(this.itemInterval);

    if (option === this.currentItem) {
      this.combo++;
      let points = 10;
      if (this.combo > 2) points += (this.combo - 2) * 2;
      this.score += points;

      if (this.score >= this.level * this.nextLevelScore) this.levelUp();

      this.nextItem();
    } else {
      this.combo = 0;
      this.endGame('❌ ¡Incorrecto!');
    }
  }

  levelUp(): void {
    this.level++;
    this.combo = 0;
    this.selectCategory();
  }

  async cargarRanking(): Promise<void> {
    this.cargando = true;
    try {
      this.resultados = await this.supabaseService.obtenerResultados('fastclick');
    } catch (error) {
      this.resultados = [];
    } finally {
      this.cargando = false;
    }
  }

  async endGame(message: string): Promise<void> {
    this.gameActive = false;
    this.gameFinished = true;
    this.juegoCompletado = true;
    this.gameOverMessage = message;

    clearInterval(this.intervalId);
    clearTimeout(this.itemTimeout);
    clearInterval(this.itemInterval);
    this.currentItem = '';
    this.cd.detectChanges();

    const tiempoJugado = Math.floor((Date.now() - this.tiempoInicio) / 1000);
    const user = this.supabaseService.getUser();
    if (!user) return;

    try {
      await this.supabaseService.guardarResultado({
        userId: user.id,
        email: user.email!,
        juego: 'fastclick',
        puntaje: this.score,
        tiempoSegundos: tiempoJugado
      });
    } catch (error) {}

    await this.cargarRanking();
  }

  volverAlMenu() {
    this.router.navigate(['/home']);
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

  // ---------------------- Instrucciones ----------------------
  abrirInstrucciones() {
    this.instruccionesAbiertas = true;
  }

  cerrarInstrucciones() {
    this.instruccionesAbiertas = false;
  }
}