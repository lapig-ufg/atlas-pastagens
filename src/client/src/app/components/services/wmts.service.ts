import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from "rxjs/operators";
import {WMTSCapabilities} from "ol/format";
const parser = new WMTSCapabilities();

@Injectable({
  providedIn: 'root'
})

export class WmtsService {
  private apiURL = '/service/http/';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }

  getCapabilities(url): Observable<any> {
    return this.httpClient.post<any>(this.apiURL + "get", {url: url}, this.httpOptions)
      .pipe(map(response => parser.read(response.data)))
      .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
