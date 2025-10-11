import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacionService } from './core/services/notificacion.service';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NgIf, NgClass],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('sala-juegos');
  constructor(public notificacion: NotificacionService) {} 
}