import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'relativeDate',
    standalone: true
})
export class fechaRelativaPipe implements PipeTransform {

    transform(value: Date | string): string {
        if (!value) return '';

        const date = new Date(value);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000; // diferencia en segundos

        if (diff < 60) return 'hace unos segundos';
        if (diff < 3600) return `hace ${Math.floor(diff / 60)} minutos`;
        if (diff < 86400) return `hace ${Math.floor(diff / 3600)} horas`;
        if (diff < 172800) return 'ayer';
        return date.toLocaleDateString(); // Si es más viejo, muestra fecha
    }
}