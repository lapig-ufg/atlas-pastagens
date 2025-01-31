/**
 * Angular imports.
 */
import { Component } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Core imports.
 */
import { LocalizationService } from '@core/internationalization/localization.service';

/**
 * PrimeNg imports.
 */
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';

/**
 * Translate imports
 */
import { TranslateModule } from '@ngx-translate/core';


@Component({
  standalone: true,
  selector: 'app-dialog-message',
  templateUrl: './dialog-message.component.html',
  styleUrls: ['./dialog-message.component.scss'],
  imports: [
    DialogModule,
    InputSwitchModule,
    FormsModule,
    TranslateModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
})
class DialogMessageComponent {
  public visible: boolean = false;

  public messageCode: number = 200;

  public messages = {
    200: {
        title: 'dialogs.submition.success.title',
        message: 'dialogs.submition.success.message'
    },
    500: {
        title: 'dialogs.submition.error.title',
        message: 'dialogs.submition.error.message'
    }
  };

  constructor(public localizationService: LocalizationService) {}

  public message(status: number): void {
    this.messageCode = status;

    this.visible = true;
  }
}

export { DialogMessageComponent };
