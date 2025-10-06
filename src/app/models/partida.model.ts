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

export interface ResultadoAhorcado {
    id?: string;
    user_id: string;              
    letras_seleccionadas: number; 
    tiempo_segundos: number;      
    gano: boolean;                
    fecha_play: string;          
}

export interface ResultadoPreguntados {
    id?: string;
    user_id: string;
    preguntas_acertadas: number;
    fecha_play: string;
}

export interface ResultadoFastClick {
    id?: string;
    user_id: string;
    puntaje: number;
    tiempo_segundos: number;
    fecha_play: string; 
}

export interface ResultadoMayorMenor {
    id?: string;
    user_id: string;
    cartas_acertadas: number;
    fecha_play: string; // ISO
}