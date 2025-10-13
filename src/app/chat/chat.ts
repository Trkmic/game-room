import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService } from '../core/services/chat.service';
import { SupabaseService } from '../core/services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Mensaje } from '../core/models/mensaje.model';
import { DisplayNamePipe } from '../core/pipes/display-name.pipe';
import { LimitadorCaracteresPipe } from '../core/pipes/limitador-caracteres.pipe';
import { fechaRelativaPipe } from '../core/pipes/fecha-relativa.pipe';
import { Router } from '@angular/router';


@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, DisplayNamePipe, LimitadorCaracteresPipe, fechaRelativaPipe],
    templateUrl: './chat.html',
    styleUrls: ['./chat.css']
})
export class Chat implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: Mensaje[] = [];
  private _newMessage = '';
  maxChars = 30;
  currentUserId = '';
  private shouldScroll = false;
  currentUserEmail = '';


  get newMessage() { return this._newMessage; }
  set newMessage(value: string) { this._newMessage = value.substring(0, this.maxChars); }

  constructor(private chatService: ChatService, 
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  async ngOnInit() {
    try {
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      this.currentUserId = user?.id || 'invitado';
      this.currentUserEmail = user?.email || '';
    } catch {
      this.currentUserId = 'invitado';
      this.currentUserEmail = '';
    }

    await this.chatService.loadMessages();

    this.chatService.messages$.subscribe(msgs => {
      this.messages = msgs.map(m => ({ ...m, fecha_envio: new Date(m.fecha_envio) }));
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  private scrollToBottom() {
    if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;

    const { data: { user } } = await this.supabaseService.client.auth.getUser();
    if (!user?.email) return;

    await this.chatService.sendMessage(user.id, this.newMessage, user.email);
    this.newMessage = '';
    this.shouldScroll = true;
  }

}