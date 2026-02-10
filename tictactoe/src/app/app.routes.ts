import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'register', pathMatch: 'full' } // Redirige al registro al abrir la web
];