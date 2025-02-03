import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { map } from "rxjs/operators";
import { Contact } from '@core/interfaces'

@Injectable({
  providedIn: 'root'
})

export class AjudaService {
  private apiURL = '/service/contact';

  static PARAMS = new HttpParams({
    fromObject: {
      format: "json"
    }
  });

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
    }),
  };

  constructor(private httpClient: HttpClient) { }

  public saveContact(contact: Contact, recaptcha: string): Observable<any> {
    return this.httpClient.post<any>(this.apiURL + `/create`, {contact},
      {
          headers: new HttpHeaders({
            'Recaptcha-Token': recaptcha,
            "Content-Type": "application/json",
          })
      })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getTags(): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/tags', this.httpOptions)
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
