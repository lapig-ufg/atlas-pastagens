import {LOCALE_ID, NgModule} from '@angular/core';
import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
import { HotsiteRoutingModule } from './hotsite-routing.module';
import { IndexComponent } from './pages/index/index.component';
import { BaseComponent } from "./pages/base/base.component";
import { FormsModule } from "@angular/forms";
import { SobreComponent } from './pages/sobre/sobre.component';
import { ArtigosComponent } from './pages/artigos/artigos.component';
import { MetodosComponent } from './pages/metodos/metodos.component';
import { GaleriaComponent } from "./pages/galeria/galeria.component";
import { AjudaComponent } from './pages/ajuda/ajuda.component';
import { TranslateModule } from "@ngx-translate/core";
import { MultiSelectModule } from "primeng/multiselect";
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { GoogleAnalyticsService } from "../components/services/google-analytics.service";
import {FilterPipe} from "../@core/pipes";
import { ToastModule } from 'primeng/toast';

import { AccordionModule } from 'primeng/accordion';

@NgModule({
  imports: [
    AccordionModule,
    CommonModule,
    HotsiteRoutingModule,
    FormsModule,
    TranslateModule,
    MultiSelectModule,
    GalleriaModule,
    ButtonModule,
    ToastModule,
  ],
  declarations: [
    IndexComponent,
    BaseComponent,
    SobreComponent,
    ArtigosComponent,
    MetodosComponent,
    GaleriaComponent,
    AjudaComponent,
    FilterPipe
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    DatePipe,
    DecimalPipe,
    GoogleAnalyticsService,
    ToastModule
  ]
})
export class HotsiteModule  {
}
