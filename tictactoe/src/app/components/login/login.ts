import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private authService = inject(AuthService);

  // En este login usaremos email + password
  email: string = '';
  password: string = '';

  onLogin() {
    const credentials = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        // Aquí más adelante puedes guardar el usuario/token y navegar
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
      },
    });
  }
}
