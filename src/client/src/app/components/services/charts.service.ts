import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  private apiURL = '/service/charts';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }

  getArea1(parameters): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/area1?' + parameters, this.httpOptions)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getArea2(parameters): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/area2?' + parameters, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getArea3(parameters): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/area3?' + parameters, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getAreaTable(parameters): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/areatable?' + parameters, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getResumo(parameters): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/resumo?' + parameters, this.httpOptions)
      .pipe(map(response => response))
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
