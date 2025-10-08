export interface Mensaje {
    id?: string;
    user_id: string;    
    mensaje: string;    
    fecha_envio: Date;          
    user_name: string;     
}