import { Component, OnInit } from '@angular/core';
import { PreguntadosService } from '../../core/services/preguntados.service';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { ResultadoGeneral } from '../../core/models/partida.model';
import { FormsModule } from '@angular/forms';
import { DisplayNamePipe } from '../../core/pipes/display-name.pipe';
import { ChatService } from '../../core/services/chat.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-preguntados',
  templateUrl: './preguntados.html',
  standalone: true,
  styleUrls: ['./preguntados.css'],
  imports: [CommonModule, FormsModule, DisplayNamePipe, AsyncPipe]
})
export class Preguntados implements OnInit {

  resultados: ResultadoGeneral[] = [];
    cargando: boolean = true;
    categoriaSeleccionada: string = '';
  tiempoInicio: number = 0;

  // ---------------------- Chat ----------------------
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
    private chatService: ChatService
    ) {}
  
    async ngOnInit() {
    this.cargando = true;
      try {
      await this.juego.cargarPreguntas();
      this.resultados = await this.supabaseService.obtenerResultados('preguntados');

      // Inicializar usuario para chat
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      this.currentUserId = user?.id || 'invitado';
      this.currentUserName = user?.email || 'Yo';

      // Cargar mensajes del chat
      await this.chatService.loadMessages();

      } catch (error) {
      console.error('Error cargando datos:', error);
        this.resultados = [];
      } finally {
        this.cargando = false;
      }
    }
  
    elegirCategoria(categoria: string) {
      if (this.juego.iniciarCategoria(categoria)) {
        this.categoriaSeleccionada = categoria;
      this.tiempoInicio = Date.now();
      }
    }
  
    async responder(index: number) {
    await this.juego.responder(index);

    if (this.juego.terminado) {
      const tiempoJugado = Math.floor((Date.now() - this.tiempoInicio) / 1000);
      const puntaje = this.juego.aciertos;

      const user = this.supabaseService.getUser();
      if (!user) {
        console.error('Usuario no logueado');
        return;
      }

      try {
        await this.supabaseService.guardarResultado({
          userId: user.id,
          email: user.email!,
          juego: 'preguntados',
          puntaje,
          tiempoSegundos: tiempoJugado
        });
      } catch (error) {
        console.error('Error guardando resultado Preguntados:', error);
      } finally {
        this.categoriaSeleccionada = '';
        this.cargarResultados();
        }
      }
    }
  
    reiniciar() {
      this.juego.reiniciar();
      this.categoriaSeleccionada = '';
    this.tiempoInicio = 0;
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