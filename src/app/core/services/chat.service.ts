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

  private supabase;
  private channelInitialized = false; // para evitar duplicados

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
  }

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

    if (!this.channelInitialized) {
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
      this.channelInitialized = true;
    }
  }

  async sendMessage(userId: string, mensaje: string, userName: string) {
    const newMsg: Message = {
      user_id: userId,
      mensaje: mensaje,
      fecha_envio: new Date().toISOString(),
      user_name: userName   
    };

    const { error } = await this.supabase
      .from('chat')
      .insert([newMsg]);

    if (error) {
      console.error('Error enviando mensaje:', error);
      return;
    }

    // Esto asegura que el mensaje se vea inmediatamente
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, newMsg]);
  }
}