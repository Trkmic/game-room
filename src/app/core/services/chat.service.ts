import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
            const incoming = payload.new as Message;
            // Verificar si ya existe el mensaje (por ID o por contenido temporal sin ID)
            const isDuplicate = current.some(m => 
              (m.id && m.id === incoming.id) ||
              (!m.id && m.user_id === incoming.user_id && m.mensaje === incoming.mensaje)
            );
            if (!isDuplicate) {
              this.messagesSubject.next([...current, incoming]);
            } else {
              // Reemplazar el mensaje temporal (que no tiene id) con el real de la DB (con id y fecha_envio oficial)
              const updated = current.map(m => 
                (!m.id && m.user_id === incoming.user_id && m.mensaje === incoming.mensaje) ? incoming : m
              );
              this.messagesSubject.next(updated);
            }
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
      return;
    }

    const current = this.messagesSubject.getValue();
    const exists = current.some(m => 
      (m.id && m.user_id === userId && m.mensaje === mensaje) || 
      (!m.id && m.user_id === userId && m.mensaje === mensaje)
    );
    if (!exists) {
      this.messagesSubject.next([...current, newMsg]);
    }
  }
}