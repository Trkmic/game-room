import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'limitadorCaracteres'
})
export class LimitadorCaracteresPipe implements PipeTransform {
    transform(value: string, max: number): string {
        if (!value) return '0';
        return value.length > max ? `${max}` : `${value.length}`;
        }
}
