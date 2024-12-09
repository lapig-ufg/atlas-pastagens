import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from "rxjs/operators";
import { environment } from "../../../environments/environment";

export { GalleryService };

@Injectable({
  providedIn: 'root'
})
class GalleryService {


  private apiURL = '/service/gallery';

  static PARAMS = new HttpParams({
    fromObject: {
      format: "json"
    }
  });

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) {
    if (!environment.production) {
      this.apiURL = environment.APP_URL + this.apiURL;
    }
  }

  getGalleryListById(params: string): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/field?' + params, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getFileForGallery(params: any): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/field/' + params.category + '/'
      + params.tablename + '/' + params.id + '/' + params.filename, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }


  errorHandler(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
