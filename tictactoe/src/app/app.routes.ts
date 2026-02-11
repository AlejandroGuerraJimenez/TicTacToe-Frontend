import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';
import { PlaceholderComponent } from './components/placeholder/placeholder';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'game', component: PlaceholderComponent, data: { label: 'Juego — Próximamente' } },
  { path: 'friends', component: PlaceholderComponent, data: { label: 'Amigos — Próximamente' } },
  { path: 'profile', component: PlaceholderComponent, data: { label: 'Perfil — Próximamente' } },
];