import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'friends', loadComponent: () => import('./components/friends/friends').then(m => m.FriendsComponent) },
      { path: 'games/:id', loadComponent: () => import('./components/game-play/game-play').then(m => m.GamePlayComponent) },
      { path: 'games', loadComponent: () => import('./components/games/games').then(m => m.GamesComponent) },
    ]
  },
];