import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked  } from '@angular/core';
import { ChatService} from '../core/chat.service';
import { SupabaseService } from '../core/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Mensaje } from '../models/mensaje.model';
import { DisplayNamePipe } from '../core/display-name.pipe';


@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, DisplayNamePipe],
    templateUrl: './chat.html',
    styleUrls: ['./chat.css']
})
export class Chat implements OnInit, AfterViewChecked {
    @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
    messages: Mensaje[] = [];
    newMessage = '';
    currentUserId = '';
    private shouldScroll = false;
  
    constructor(
      private chatService: ChatService,
      private supabaseService: SupabaseService
    ) {}
  
    async ngOnInit() {
      try {
        const { data: { user } } = await this.supabaseService.client.auth.getUser();
        this.currentUserId = user?.id || 'invitado';
      } catch {
        this.currentUserId = 'invitado';
      }
  
      await this.chatService.loadMessages();
  
      this.chatService.messages$.subscribe(msgs => {
        this.messages = msgs.map(m => ({
          ...m,
          fecha_envio: new Date(m.fecha_envio) // convertir string a Date
        }));
        this.shouldScroll = true;
      });
    }
  
    ngAfterViewChecked() {
      if (this.shouldScroll) {
        this.scrollToBottom();
        this.shouldScroll = false;
      }
    }
  
    private scrollToBottom() {
      if (this.chatContainer) {
        try {
          this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
        } catch {}
      }
    }
  
    async sendMessage() {
      if (!this.newMessage.trim()) return;
  
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      if (!user?.email) return; // si no hay email, no enviar
  
      const userName: string = user.email;
  
      await this.chatService.sendMessage(
        user.id,           // user_id
        this.newMessage,   // mensaje
        userName           // user_name
      );
  
      this.newMessage = '';
      this.shouldScroll = true;
    }
}