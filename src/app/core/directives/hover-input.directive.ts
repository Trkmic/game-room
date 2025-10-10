import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appHoverInput]',
    standalone: true
})
export class HoverInputDirective {
    @Input() hoverClass: string = 'hovered'; 

    constructor(private el: ElementRef, private renderer: Renderer2) {}

    @HostListener('mouseenter') onMouseEnter() {
        this.renderer.addClass(this.el.nativeElement, this.hoverClass);
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.renderer.removeClass(this.el.nativeElement, this.hoverClass);
    }
}