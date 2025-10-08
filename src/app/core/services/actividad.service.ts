import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ActividadService {
    
    private ultimaActividad = Date.now();
    private readonly TIME_LIMIT = 5 * 60 * 1000; // 5 minutos

    constructor() {
        this.escucharActividad();
    }

    private escucharActividad() {
        const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
        events.forEach(event =>
        window.addEventListener(event, () => this.actualziarActividad())
        );
    }

    private actualziarActividad() {
        this.ultimaActividad = Date.now();
    }

    isSessionExpired(): boolean {
        return Date.now() - this.ultimaActividad > this.TIME_LIMIT;
    }
}