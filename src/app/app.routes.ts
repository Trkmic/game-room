import { Routes } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { GuestGuard } from './auth/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('./home/home').then(m => m.Home)
  },
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadComponent: () => import('./auth/login/login').then(m => m.Login)
  },
  {
    path: 'registro',
    canActivate: [GuestGuard],
    loadComponent: () => import('./auth/registro/registro').then(m => m.Registro)
  },
  {
    path: 'quien-soy',
    loadComponent: () => import('./quien-soy/quien-soy').then(m => m.QuienSoy)
  },
  {
    path: 'chat',
    canActivate: [AuthGuard],
    loadComponent: () => import('./chat/chat').then(m => m.Chat)
  },
  {
    path: 'resultados',
    canActivate: [AuthGuard],
    loadComponent: () => import('./results/resultados').then(m => m.Resultados)
  },
  {
    path: 'ahorcado',
    canActivate: [AuthGuard],
    loadComponent: () => import('./games/ahorcado/ahorcado').then(m => m.Ahorcado)
  },
  {
    path: 'mayor-menor',
    canActivate: [AuthGuard],
    loadComponent: () => import('./games/mayor-menor/mayor-menor').then(m => m.MayorMenor)
  },
  {
    path: 'preguntados',
    canActivate: [AuthGuard],
    loadComponent: () => import('./games/preguntados/preguntados').then(m => m.Preguntados)
  },
  {
    path: 'juego-propio',
    canActivate: [AuthGuard],
    loadComponent: () => import('./games/juego-propio/juego-propio').then(m => m.JuegoPropio)
  },
  {
    path: 'encuesta',
    canActivate: [AuthGuard],
    loadComponent: () => import('./encuesta/encuesta/encuesta').then(m => m.Encuesta)
  },

  { path: '**', redirectTo: 'home' }
];