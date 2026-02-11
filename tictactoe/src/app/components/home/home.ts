import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);

  user$ = this.authService.currentUser$;

  ngOnInit(): void {
    // Ya no es necesario llamar a me() explícitamente porque el guard llama a checkSession()
    // y actualiza el estado en AuthService.
  }
}
