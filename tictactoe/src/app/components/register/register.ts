import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterModule],
  templateUrl: './register.html',
})
export class RegisterComponent {
  
  private authService = inject(AuthService);

  username: string = '';
  email: string = '';
  password: string = '';

  onRegister() {
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
      },
      error: (error) => {
        console.error('Error al registrar:', error);
      }
    });
  }
}
