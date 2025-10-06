export interface Encuesta {
    id?: string;               // UUID generado por Supabase
    user_id: string;           // ID del usuario autenticado (lo guardaremos luego)
    nombreApellido: string;
    edad: number;
    telefono: string;
    pregunta1: string;
    pregunta2: string[];
    pregunta3: string;
    fecha: string;            // ISO date
}