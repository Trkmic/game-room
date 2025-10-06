import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FastClickService } from '../../core/fastclick.service';
import { SupabaseService } from '../../core/supabase.service';
import { ResultadoFastClick } from '../../models/partida.model';

type Category = 'Colores' | 'Animales' | 'Frutas';

@Component({
  selector: 'juego-propio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juego-propio.html',
  styleUrls: ['./juego-propio.css']
})
export class JuegoPropio implements OnInit, OnDestroy {

  score = 0;
  timeLeft = 30;
  gameActive = false;
  gameFinished = false;
  gameOverMessage = '';

  level = 1;
  combo = 0;
  nextLevelScore = 50;
  baseItemTime = 1500;

  intervalId: any;
  itemTimeout: any;
  itemInterval: any;
  itemTimeLeft = 0;
  maxItemTime = 0;

  categories: Record<Category, string[]> = {
    Colores: ['Rojo', 'Verde', 'Azul', 'Amarillo', 'Morado'],
    Animales: ['Perro', 'Gato', 'Elefante', 'Tigre', 'Mono'],
    Frutas: ['Manzana', 'Banana', 'Naranja', 'Uva', 'Pera']
  };

  currentCategory: Category = 'Colores';
  currentItem = '';
  options: string[] = [];

  // 🔹 Ranking
  resultados: ResultadoFastClick[] = [];
  cargando: boolean = true;

  constructor(
    private fastClickService: FastClickService,
    private supabaseService: SupabaseService // 🔹 Inyección correcta
  ) {
    this.options = this.categories[this.currentCategory];
  }

  ngOnInit(): void {
    this.cargarRanking();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearTimeout(this.itemTimeout);
    clearInterval(this.itemInterval);
  }

  // ====================== JUEGO ======================
  startGame(): void {
    this.score = 0;
    this.level = 1;
    this.combo = 0;
    this.timeLeft = 30;
    this.gameActive = true;
    this.gameFinished = false;
    this.gameOverMessage = '';

    this.selectCategory();
    this.nextItem();

    this.intervalId = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) this.endGame('¡Se acabó el tiempo del juego!');
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
        this.endGame('¡Se acabó el tiempo!');
      }
    }, this.maxItemTime * 1000);

    this.itemInterval = setInterval(() => {
      this.itemTimeLeft = Math.max(0, this.itemTimeLeft - 0.1);
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
      this.endGame('¡Incorrecto! Fin del juego.');
    }
  }

  levelUp(): void {
    this.level++;
    this.combo = 0;
    this.selectCategory();
  }

  // ====================== RANKING ======================
  async cargarRanking(): Promise<void> {
    this.cargando = true;
    try {
      const resultados = await this.supabaseService.obtenerResultadosFastClick();
      this.resultados = resultados;
    } catch (error) {
      console.error('Error cargando ranking FastClick:', error);
      this.resultados = [];
    } finally {
      this.cargando = false;
    }
  }

  async endGame(message: string): Promise<void> {
    this.gameActive = false;
    this.gameFinished = true;
    this.gameOverMessage = message;

    clearInterval(this.intervalId);
    clearTimeout(this.itemTimeout);
    clearInterval(this.itemInterval);
    this.currentItem = '';

    await this.fastClickService.guardarResultado(this.score, 30 - this.timeLeft);
    await this.cargarRanking();
  }
}
