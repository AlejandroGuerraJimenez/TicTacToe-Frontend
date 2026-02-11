import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PlaceholderComponent } from './components/placeholder/placeholder';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'game', component: PlaceholderComponent, data: { label: 'Juego — Próximamente' } },
      { path: 'friends', component: PlaceholderComponent, data: { label: 'Amigos — Próximamente' } },
      { path: 'profile', component: PlaceholderComponent, data: { label: 'Perfil — Próximamente' } },
    ]
  },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
];