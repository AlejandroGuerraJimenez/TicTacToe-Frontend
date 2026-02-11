import { Component, inject } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  imports: [RouterModule],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4">
      <p class="text-slate-600 text-lg mb-6">{{ label }}</p>
      <a routerLink="/home" class="text-blue-600 hover:underline font-medium">Volver al inicio</a>
    </div>
  `,
})
export class PlaceholderComponent {
  private route = inject(ActivatedRoute);
  label = this.route.snapshot.data['label'] ?? 'Próximamente';
}
