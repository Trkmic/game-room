import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-quien-soy',
    imports: [CommonModule],
    templateUrl: './quien-soy.html',
    standalone: true,
    styleUrls: ['./quien-soy.css']
})
export class QuienSoy implements OnInit {
    githubData: any = null;
    repos: any[] = [];
    constructor(private router: Router) {}
    
    navegar(ruta: string) {
      this.router.navigate([ruta]);
    }

    ngOnInit() {
      this.githubData = {
        login: 'Trkmic',
        name: 'Ignacio Trkmic Torres',
        bio: 'Estudiante de Programación en UTN Avellaneda. Full Stack Developer en progreso.',
        html_url: 'https://github.com/Trkmic'
      };
    }

  

}








    // ngOnInit() {
    //   this.http.get('https://api.github.com/users/Trkmic')
    //     .subscribe({
    //       next: data => this.githubData = data,
    //       error: err => {
    //         this.errorMessage = 'No se pudieron cargar los datos de GitHub';
    //         console.error('Error al obtener datos de GitHub', err);
    //       }
    //     });
    