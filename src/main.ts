import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http'; // <-- Importar aquí

bootstrapApplication(App, {
  ...appConfig,             // Mantener tu config existente
  providers: [
    ...(appConfig.providers || []), // conservar otros providers
    provideHttpClient()             // <-- Agregar HttpClient
  ]
})
.catch((err: any) => console.error(err));