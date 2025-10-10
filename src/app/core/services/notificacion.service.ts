// notificacion.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
    mensaje = signal<string>('');
    tipo = signal<'exito' | 'error'>('exito');

    mostrar(mensaje: string, tipo: 'exito' | 'error' = 'exito', duracion = 2000) {
        this.mensaje.set(mensaje);
        this.tipo.set(tipo);
        setTimeout(() => this.mensaje.set(''), duracion);
    }
}