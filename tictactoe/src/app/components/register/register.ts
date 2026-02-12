import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  username = '';
  email = '';
  password = '';
  error = '';
  usernameError = '';
  emailError = '';
  passwordError = '';
  loading = false;

  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_USERNAME = 4;
  private static readonly MIN_PASSWORD = 6;

  private validate(): boolean {
    this.error = '';
    this.usernameError = '';
    this.emailError = '';
    this.passwordError = '';
    const usernameTrim = this.username.trim();
    const emailTrim = this.email.trim();

    if (!usernameTrim) this.usernameError = 'El nombre de usuario es obligatorio';
    else if (usernameTrim.length < RegisterComponent.MIN_USERNAME) this.usernameError = `Mínimo ${RegisterComponent.MIN_USERNAME} caracteres`;
    if (!emailTrim) this.emailError = 'El correo electrónico es obligatorio';
    else if (!RegisterComponent.EMAIL_REGEX.test(emailTrim)) this.emailError = 'Introduce un correo electrónico válido';
    if (!this.password) this.passwordError = 'La contraseña es obligatoria';
    else if (this.password.length < RegisterComponent.MIN_PASSWORD) this.passwordError = `Mínimo ${RegisterComponent.MIN_PASSWORD} caracteres`;

    const firstError = this.usernameError || this.emailError || this.passwordError;
    if (firstError) this.error = firstError;
    return !firstError;
  }

  onRegister() {
    if (!this.validate()) return;
    this.error = '';
    this.loading = true;
    const userData = {
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password,
    };

    this.authService.register(userData).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
        this.error = err.error?.error ?? 'Error al crear la cuenta. Inténtalo de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }
}
