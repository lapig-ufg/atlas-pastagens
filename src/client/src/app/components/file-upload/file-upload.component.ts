import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {
  HttpClient,
  HttpResponse,
  HttpRequest,
  HttpEventType,
  HttpErrorResponse
} from '@angular/common/http';
import { Subscription, of } from 'rxjs';
import { catchError, last, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [animate(300, style({ opacity: 0 }))])
    ])
  ]
})
export class FileUploadComponent implements OnInit {

  /** Link text */
  @Input() text = 'Upload';

  /** Attribute use for set or not multiple files */
  @Input() multiple = false;

  /** control visual progres bar */
  @Input() loading = false;

  /** Name used in form which will be sent in HTTP request. */
  @Input() param = 'shapefile';

  /** Target URL for file uploading. */
  @Input() target = '/service/upload/spatial-file?';

  /** File extension that accepted, same as 'accept' of <input type="file" />. By the default, it's set to 'image/*'. */
  @Input() accept = '.kmz, .zip';

  /** Allow you to configure drag and drop area shown or not. */
  @Input() ddarea = false;

  @Input() tooltip: string;

  @Input() app_origin: string;

  /** Max size allowed in MB*/
  @Input() maxSize: number = 15;

  @Input() maxSizeMsg: string;

  /** Max size allowed in MB*/
  @Input() language: string = "pt";

  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();

  response = {
    error: false,
    msg: ""
  }

  files: Array<FileUploadModel> = [];
  languages: any = [];
  constructor(private _http: HttpClient) {
    this.languages['pt'] = 'pt';
    this.languages['en'] = 'en';
    this.maxSize = (this.maxSize * 1024 * 1024);

  }

  ngOnInit() { }

  onClick() {
    // this.target = '/service/upload/spatial-file' + "?lang=" 
    let self = this;

    const fileUpload = document.getElementById(
      'fileUpload'
    ) as HTMLInputElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files!.length; index++) {

        if (index > 0) {
          //Will add only first file
        } else {

          if (fileUpload.files![index].size > this.maxSize) {
            this.response.error = true;
            let msg = this.maxSizeMsg.replace("[current-size]", (fileUpload.files![index].size / 1024 / 1024).toFixed(1));
            msg = msg.replace("[max-size]", ((self.maxSize / 1024) / 1024).toString());
            this.response.msg = msg;
            this.complete.emit();
          } else {
            const file = fileUpload.files![index];
            this.files.push({
              data: file,
              state: 'in',
              inProgress: false,
              progress: 0,
              canRetry: false,
              canCancel: true
            });
          }

        }

      }
      this.uploadFiles();
    };
    fileUpload.click();
  }

  cancelFile(file: FileUploadModel) {
    if (file) {
      if (file.sub) {
        file.sub.unsubscribe();
      }
      this.removeFileFromArray(file);
    }

    this.response.error = false
  }

  retryFile(file: FileUploadModel) {
    this.uploadFile(file);
    file.canRetry = false;
    this.response.error = false
  }

  uploadFile(file: FileUploadModel) {

    let params: string[] = [];
    params.push('lang=' + this.language)

    if (this.app_origin) {
      params.push('app=' + this.app_origin)
    }

    let urlParams = this.target + params.join('&');

    const fd = new FormData();
    fd.append(this.param, file.data);

    this.loading = true;
    this.response.error = false;
    this.response.msg = '';

    const req = new HttpRequest('POST', urlParams, fd, {
      reportProgress: true
    });

    file.inProgress = true;
    file.sub = this._http
      .request(req)
      .pipe(
        map(event => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              file.progress = Math.round((event.loaded * 100) / (event.total ? event.total : 1));
              break;
            case HttpEventType.Response:
              return event;
          }
        }),
        tap(message => { }),
        last(),
        catchError((error: HttpErrorResponse) => {
          this.loading = false;
          file.inProgress = false;
          file.canRetry = true;
          this.response.error = true;

          let msg = error.error.match("<pre>(.*?)</pre>");

          if (msg == null) {
            this.response.msg = error.error

          } else {
            this.response.msg = msg[1].replace("Error:", "");
          }

          this.removeFileFromArray(file);
          this.complete.emit();

          return of(`${file.data.name} upload failed.`);
        })
      )
      .subscribe((event: any) => {
        if (typeof event === 'object') {
          this.loading = false;
          this.removeFileFromArray(file);
          this.complete.emit(event.body);
        }
      });
  }

  uploadFiles() {
    const fileUpload = document.getElementById(
      'fileUpload'
    ) as HTMLInputElement;
    fileUpload.value = '';

    this.files.forEach(file => {
      if (!file.inProgress) {
        this.uploadFile(file);
      }
    });
  }

  removeFileFromArray(file: FileUploadModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  dropHandler(ev: DragEvent) {

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    let self = this;

    if (ev?.dataTransfer?.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {

        if (i > 0) {
          //Will add only first file
        } else {
          // If dropped items aren't files, reject them
          if (ev.dataTransfer.items[i].kind === 'file') {
            const file = ev.dataTransfer.items[i].getAsFile();
            if (file!.size > this.maxSize) {
              this.response.error = true;
              let msg = this.maxSizeMsg.replace("[current-size]", (file!.size / 1024 / 1024).toFixed(1));
              msg = msg.replace("[max-size]", ((self.maxSize / 1024) / 1024).toString());
              this.response.msg = msg;
              this.complete.emit();
            } else {

              this.files.push({
                data: file!,
                state: 'in',
                inProgress: false,
                progress: 0,
                canRetry: false,
                canCancel: true
              });
            }
          }
        }


      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < ev!.dataTransfer!.files.length; i++) {
        this.files.push({
          data: ev!.dataTransfer!.files[i],
          state: 'in',
          inProgress: false,
          progress: 0,
          canRetry: false,
          canCancel: true
        });
      }
    }

    this.uploadFiles();
  }

  dragOverHandler(ev: DragEvent) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  showCardError() {
    return this.response.error == true && this.files.length == 0;
  }

}

export class FileUploadModel {
  data: File;
  state: string;
  inProgress: boolean;
  progress: number;
  canRetry: boolean;
  canCancel: boolean;
  sub?: Subscription;
}