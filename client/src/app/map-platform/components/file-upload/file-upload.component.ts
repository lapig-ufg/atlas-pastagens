import { Component, Input, Output } from '@angular/core';
import { EventEmitter, ViewChild } from '@angular/core';
import { trigger, state, style } from '@angular/animations';
import { animate, transition } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Subscription, of } from 'rxjs';
import { LocalizationService } from '@core/internationalization/localization.service';
import { AnalysisService } from '../../../@core/services';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { UserInfoComponent } from '@core/components/user-info-dialog/user-info-dialog.component';
import { UserInfo } from '@core/interfaces/user_info';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
})
export class FileUploadComponent {
  @ViewChild(UserInfoComponent) userInfo!: UserInfoComponent;

  @ViewChild('fileUpload') fileUpload!: HTMLInputElement;

  public maxSize: number = 15;

  private userData: any = {};

  public MAX_FILE_SIZE = 5 * 1024 * 1024;

  public files: Array<FileUploadModel> = [];

  private lang: string;

  constructor(
    private analysisService: AnalysisService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private localizationService: LocalizationService
  ) {
    this.lang = localizationService.currentLang();

    // TODO: Se não tirar subscrição pode afetar performance.
    localizationService.translateService.onLangChange.subscribe({
      next: (lang: string) => {
        this.lang = lang;
      },
    });

    this.maxSize = this.maxSize * 1024 * 1024;
  }

  public onInputChange(event) {
    const input = event.target as HTMLInputElement;

    if (input.files === null || input.files.length <= 0) return;

    this.userInfo.getUserInfo().subscribe({
      next: (userInfo: UserInfo) => {
        this.uploadFile(input.files![0], userInfo);

        this.reset(input)
      },
    });
  }

  public onDrop(event: DragEvent) {
    const files = event.dataTransfer?.files;

    this.userInfo.getUserInfo().subscribe({
      next: (userInfo: UserInfo) => {
        if (files && files.length > 0) {
          const file = files[0];
        }
      },
    });
  }

  public onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // TODO: submeter usuário.
  private uploadFile(file: File, user: UserInfo): void {
    this.recaptchaV3Service
      .execute('importantAction')
      .subscribe((recaptcha: string) => {
        this.analysisService
          .saveFile(file, user, recaptcha).subscribe((response) => {
            console.log(response)
          });
      });
  }

  private reset(input) {
    input.value = '';
    input.files = null;
  }
}

export interface FileUploadModel {
  data: File;
  state: 'uploading' | 'failed' | 'sucess';
  progress: number;
}
