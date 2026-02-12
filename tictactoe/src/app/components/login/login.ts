import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  error = '';
  emailError = '';
  passwordError = '';
  loading = false;

  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private validate(): boolean {
    this.error = '';
    this.emailError = '';
    this.passwordError = '';
    const emailTrim = this.email.trim();
    const hasEmail = !!emailTrim;
    const hasPassword = !!this.password;

    if (!hasEmail) this.emailError = 'El correo electrónico es obligatorio';
    else if (!LoginComponent.EMAIL_REGEX.test(emailTrim)) this.emailError = 'Introduce un correo electrónico válido';
    if (!hasPassword) this.passwordError = 'La contraseña es obligatoria';

    const firstError = this.emailError || this.passwordError;
    if (firstError) this.error = firstError;
    return !firstError;
  }

  onLogin() {
    if (!this.validate()) return;
    this.error = '';
    this.loading = true;
    const credentials = { email: this.email.trim(), password: this.password };

    this.authService.login(credentials).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
        this.error = err.error?.error ?? 'Error al iniciar sesión. Comprueba tu conexión.';
        this.cdr.detectChanges();
      },
    });
  }
}
