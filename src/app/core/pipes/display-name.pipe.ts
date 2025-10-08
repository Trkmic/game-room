import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'displayName',
    standalone: true 
})

export class DisplayNamePipe implements PipeTransform {
    transform(email: string | undefined): string {
    if (!email) return 'Usuario';
        return email.includes('@') ? email.split('@')[0] : email;
    }
}