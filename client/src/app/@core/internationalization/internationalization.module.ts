import { APP_INITIALIZER, LOCALE_ID, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from './localization.service';
import { LocalizationServiceConfig } from './localization-config.service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule, TranslateModule.forChild()],
  exports: [TranslateModule]
})
export class InternationalizationModule {
  public static forRoot(config: any): ModuleWithProviders<InternationalizationModule> {
    return {
      ngModule: InternationalizationModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: initLocalizationService,
          deps: [LocalizationService],
          multi: true
        },
        LocalizationService,
        { provide: LOCALE_ID, useValue: config.locale_id }, // using the initial value
        { provide: LocalizationServiceConfig, useValue: config }
      ]
    };
  }
}

/**
 * Initialize the localization service.
 * @param {LocalizationService} service
 * @returns {() => Promise<void>}
 */
export function initLocalizationService(service: LocalizationService) {
  return () => service.initService();
}
