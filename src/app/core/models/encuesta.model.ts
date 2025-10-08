export interface Encuesta {
    id?: string;               
    user_id: string;          
    nombreApellido: string;
    edad: number;
    telefono: string;
    pregunta1: string;
    pregunta2: string[];
    pregunta3: string;
    fecha: string;            
}