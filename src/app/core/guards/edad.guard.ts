import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { NotificacionService } from '../services/notificacion.service';

export const edadGuard: CanActivateFn = async () => {
    const supabaseService = inject(SupabaseService);
    const router = inject(Router);
    const notificacion = inject(NotificacionService);

    const user = supabaseService.getUser();

    if (!user) {
        router.navigate(['/login']);
        return false;
    }

    const { data, error } = await supabaseService.client
        .from('users')
        .select('edad')
        .eq('id', user.id)
        .single();

    if (error || !data) {
        console.error('Error obteniendo edad:', error);
        router.navigate(['/home']);
        return false;
    }

    const edad = data.edad;

    if (edad < 18) {
        notificacion.mostrar('🚫 Debes ser mayor de edad para acceder a este juego.', 'error');
        router.navigate(['/home']);
        return false;
    }

    return true;
};