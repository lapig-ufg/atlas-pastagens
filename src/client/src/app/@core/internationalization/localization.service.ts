import { Injectable, Optional, SkipSelf } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalizationServiceConfig } from './localization-config.service';
import { PrimeNGConfig } from 'primeng/api';
/**
 * Class representing the translation service.
 */
@Injectable()
export class LocalizationService {
  private _localeId: string = 'pt'; // default

  /**
   * @constructor
   * @param {LocalizationService} singleton - the localization service
   * @param {LocalizationServiceConfig} config - the localization config
   * @param {TranslateService} translateService - the translate service
   * @param primengConfig
   */
  constructor(
    @Optional() @SkipSelf() private singleton: LocalizationService,
    private config: LocalizationServiceConfig,
    public translateService: TranslateService,
    private primengConfig: PrimeNGConfig
  ) {
    if (this.singleton) {
      throw new Error(
        'LocalizationService is already provided by the root module'
      );
    }
    this._localeId = this.config.locale_id;
  }

  /**
   * Initialize the service.
   * @returns {Promise<void>}
   */
  public initService(): Promise<void> {
    // language code same as file name.
   const lng = localStorage.getItem('lang');

   if(lng){
     this._localeId = lng;
   } else {
     let browserLang = this.translateService.getBrowserLang();
     this._localeId = browserLang.match(/en|pt/) ? browserLang : 'en';
   }
    return this.useLanguage(this._localeId);
  }

  /**
   * change the selected language
   * @returns {Promise<void>}
   */
  public useLanguage(lang: string): Promise<void> {
    const self = this;
    return this.translateService
      .use(lang)
      .toPromise()
      .then(r => {
        self.translateService.get('primeng').subscribe(res => self.primengConfig.setTranslation(res));
      })
      .catch((e) => {
        throw new Error('LocalizationService.init failed: '+ e.message);
      });
  }

  /**
   * Gets the instant translated value of a key (or an array of keys).
   * @param key
   * @param interpolateParams
   * @returns {string|any}
   */
  public translate(key: string | string[], interpolateParams?: object): string {
    return this.translateService.instant(key, interpolateParams) as string;
  }

  public currentLang(){
    return this.translateService.currentLang;
  }
}
