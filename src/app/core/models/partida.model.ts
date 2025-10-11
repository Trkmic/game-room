export interface Partida {
    id?: string;
    usuarioId: string;
    juego: string;
    puntaje: number;
    tiempo: number; 
}

export interface Pregunta {
    categoria: string;
    pregunta: string;
    opciones: string[];
    correcta: number;
}

/**
   * Modelo unificado para los resultados de todos los juegos
   */
export interface ResultadoGeneral {
    id?: string;
    user_id: string;
    email: string;
    juego: string;
    puntaje: number;
    tiempo_segundos: number;
    fecha_play: string; 
}