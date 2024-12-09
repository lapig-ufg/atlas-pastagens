/**
 * Angular imports.
 */
import { Component, EventEmitter } from '@angular/core';
import { Output, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Core imports.
 */
import { UserInfo } from '@core/interfaces/user_info';
import { LocalizationService } from '@core/internationalization/localization.service';

/**
 * PrimeNg imports.
 */
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';

/**
 * Translate imports
 */
import { TranslateModule } from '@ngx-translate/core';

import { Observable, Subject } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-user-info-dialog',
  templateUrl: './user-info-dialog.component.html',
  styleUrls: ['./user-info-dialog.component.scss'],
  imports: [
    DialogModule,
    ButtonModule,
    InputSwitchModule,
    FormsModule,
    TranslateModule,
    InputTextModule,
    CheckboxModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
})
class UserInfoComponent {
  private subject$: Subject<UserInfo> | null = null;

  public isActive: boolean = false;

  public userName: string = '';
  public userEmail: string = '';

  public isNameValid: boolean = false;
  public isEmailValid: boolean = false;

  public isTermsAccepted: boolean = false;

  constructor(public localizationService: LocalizationService) {}

  public getUserInfo(): Subject<UserInfo> {
    this.isActive = true;

    this.subject$ = new Subject<UserInfo>()

    return this.subject$;
  }

  public next(): void {
    this.isActive = false;

    this.subject$?.next({ name: this.userName, email: this.userEmail })

    this.subject$?.complete()

    this.reset();
  }

  public cancel(): void {
    this.isActive = false;

    this.reset();
  }

  public reset(): void {
    this.userName = '';
    this.userEmail = '';
    this.isTermsAccepted = false;
    this.subject$ = null
  }

  public validateName() {
    const pattern = new RegExp('^[A-Za-zÀ-ÿçÇ ]+$');

    this.isNameValid = pattern.test(this.userName);
  }

  public validateEmail() {
    const pattern = new RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$');

    this.isEmailValid = pattern.test(this.userEmail);
  }
}

export { UserInfoComponent };
