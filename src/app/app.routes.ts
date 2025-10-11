import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { InactividadGuard } from './core/guards/inactividad.guard';
import { edadGuard } from './core/guards/edad.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    canActivate: [InactividadGuard],
    loadComponent: () => import('./home/home').then(m => m.Home)
  },
  {
    path: 'login',
    canActivate: [GuestGuard, InactividadGuard],
    loadComponent: () => import('./auth/login/login').then(m => m.Login)
  },
  {
    path: 'registro',
    canActivate: [GuestGuard, InactividadGuard],
    loadComponent: () => import('./auth/registro/registro').then(m => m.Registro)
  },
  {
    path: 'quien-soy',
    canActivate: [InactividadGuard],
    loadComponent: () => import('./quien-soy/quien-soy').then(m => m.QuienSoy)
  },
  {
    path: 'chat',
    canActivate: [AuthGuard, InactividadGuard],
    loadComponent: () => import('./chat/chat').then(m => m.Chat)
  },
  {
    path: 'resultados',
    canActivate: [AuthGuard, InactividadGuard],
    loadComponent: () => import('./results/resultados').then(m => m.Resultados)
  },
  {
    path: 'ahorcado',
    canActivate: [AuthGuard, InactividadGuard],
    loadComponent: () => import('./games/ahorcado/ahorcado').then(m => m.Ahorcado)
  },
  {
    path: 'mayor-menor',
    canActivate: [AuthGuard, InactividadGuard],
    loadComponent: () => import('./games/mayor-menor/mayor-menor').then(m => m.MayorMenor)
  },
  {
    path: 'preguntados',
    canActivate: [AuthGuard, InactividadGuard],
    loadComponent: () => import('./games/preguntados/preguntados').then(m => m.Preguntados)
  },
  {
    path: 'juego-propio',
    canActivate: [AuthGuard, InactividadGuard, edadGuard],
    loadComponent: () => import('./games/juego-propio/juego-propio').then(m => m.JuegoPropio)
  },
  {
    path: 'encuesta',
    canActivate: [AuthGuard, InactividadGuard],
    loadComponent: () => import('./encuesta/encuesta/encuesta').then(m => m.EncuestaComponent)
  },

  { path: '**', redirectTo: 'home' }
];