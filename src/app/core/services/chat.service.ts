import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export interface Message {
  id?: string;
  user_id: string;
  user_name: string;  
  mensaje: string;
  fecha_envio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
  }

  /** Cargar mensajes históricos */
  async loadMessages() {
    const { data, error } = await this.supabase
      .from('chat')
      .select('*')
      .order('fecha_envio', { ascending: true });

    if (error) {
      console.error('Error cargando mensajes:', error);
      return;
    }

    this.messagesSubject.next(data || []);

    // Suscripción en tiempo real
    this.supabase
      .channel('public:chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat' },
        (payload) => {
          const current = this.messagesSubject.getValue();
          this.messagesSubject.next([...current, payload.new as Message]);
        }
      )
      .subscribe();
  }

  /** Enviar un nuevo mensaje */
  async sendMessage(userId: string, mensaje: string, userName: string) {
    const newMsg: Message = {
      user_id: userId,
      mensaje: mensaje,
      fecha_envio: new Date().toISOString(),
      user_name: userName   
    };

    // Insertar en la base de datos
    const { error } = await this.supabase
      .from('chat')
      .insert([newMsg]);

    if (error) {
      console.error('Error enviando mensaje:', error);
      return;
    }

    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, newMsg]);
  }
}
