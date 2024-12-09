/**
 * Angular imports.
 */
import { LOCALE_ID, NgModule, OnInit } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { CommonModule, registerLocaleData } from '@angular/common';

/**
 * Components imports.
 */
import { AnalysisComponent } from './components/analysis/analysis.component';
import { AnalysisRoutingModule } from './analysis-routing.module';

/**
 * PrimeNG imports.
 */
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { CarouselModule } from 'primeng/carousel';
import { LoadingSpinnerComponent } from '@core/components/loading_spinner/loading_spinner.component';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    AnalysisComponent
  ],
  imports: [
    CarouselModule,
    ChartModule,
    ButtonModule,
    TabViewModule,
    MessagesModule,
    ProgressSpinnerModule,
    CommonModule,
    AnalysisRoutingModule ,
    LoadingSpinnerComponent
  ],
  exports: [
    MessagesModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
})
export class AnalysisModule {
}
