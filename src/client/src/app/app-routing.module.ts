import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from "./hotsite/pages/error/error.component";

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./hotsite/hotsite.module')
      .then(m => m.HotsiteModule),
  },
  {
    path: 'map',
    loadChildren: () => import('./components/components.module')
      .then(m => m.ComponentsModule),
  },
  {
    path: '**',
    component: ErrorComponent,
  },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
