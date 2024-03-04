import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from "./pages/index/index.component";
import { MetodosComponent } from "./pages/metodos/metodos.component";
import { SobreComponent } from "./pages/sobre/sobre.component";
import { ArtigosComponent } from "./pages/artigos/artigos.component";
import { GaleriaComponent } from "./pages/galeria/galeria.component";
import { AjudaComponent } from './pages/ajuda/ajuda.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
  },
  {
    path: 'sobre',
    component: SobreComponent,
  },
  {
    path: 'metodos',
    component: MetodosComponent,
  },
  {
    path: 'artigos',
    component: ArtigosComponent,
  },
  {
    path: 'galeria',
    component: GaleriaComponent,
  },
  {
    path: 'ajuda',
    component: AjudaComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class HotsiteRoutingModule { }
