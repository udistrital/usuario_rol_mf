import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/_guards/auth.guard';

export const routes: Routes = [
  {
    path: 'gestion-usuarios',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/gestion-usuarios/gestion-usuarios.module').then(
        (m) => m.GestionUsuariosModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/configuracion/' },
    provideHttpClient(withFetch()),
  ],
})
export class AppRoutingModule {}
