import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  user: { id: number; username: string; email: string } | null = null;
  username = '';
  email = '';
  error = '';
  message = '';
  loading = false;
  saving = false;

  ngOnInit() {
    this.loading = true;
    this.authService.me().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (res) => {
        if (res.success && res.user) {
          this.user = res.user;
          this.username = res.user.username;
          this.email = res.user.email;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil';
        this.cdr.detectChanges();
      },
    });
  }

  save() {
    this.error = '';
    this.message = '';
    const usernameTrim = this.username.trim();
    const emailTrim = this.email.trim();
    if (!usernameTrim || usernameTrim.length < 2) {
      this.error = 'El nombre de usuario debe tener al menos 2 caracteres';
      this.cdr.detectChanges();
      return;
    }
    if (!emailTrim) {
      this.error = 'El correo electrónico es obligatorio';
      this.cdr.detectChanges();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      this.error = 'Introduce un correo electrónico válido';
      this.cdr.detectChanges();
      return;
    }
    if (usernameTrim === this.user?.username && emailTrim === this.user?.email) {
      this.message = 'No hay cambios que guardar';
      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.authService.updateProfile({ username: usernameTrim, email: emailTrim }).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (res) => {
        if (res.success && res.user) {
          this.user = res.user;
          this.message = 'Perfil actualizado correctamente';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.error ?? 'Error al actualizar el perfil';
        this.cdr.detectChanges();
      },
    });
  }
}
