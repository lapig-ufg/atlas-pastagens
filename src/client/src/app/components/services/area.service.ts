import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from "rxjs/operators";
import {Job} from "../../@core/interfaces/job";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  private apiURL = '/service/upload';

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

  constructor(private httpClient: HttpClient) { }

  analysisAreaInfo(params): Observable<any> {

    return this.httpClient.get<any>(this.apiURL + '/areainfo?' + params, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getSavedAnalysis(params): Observable<any> {

    return this.httpClient.get<any>(this.apiURL + '/getanalysis?' + params, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getGeoJsonByToken(params): Observable<any> {

    return this.httpClient.get<any>(this.apiURL + '/findgeojsonbytoken?' + params, this.httpOptions)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  saveDrawedGeometry(term: any): Observable<any> {
    return this.httpClient.post<any>(
      this.apiURL + '/savegeom',
      JSON.stringify(term),
      this.httpOptions)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  saveAnalysisOnDB(dados): Observable<any> {
    return this.httpClient.post<any>(this.apiURL + '/saveanalysis', JSON.stringify(dados, null, 2), this.httpOptions)
      .pipe(map(response => JSON.parse(response.data)))
      .pipe(catchError(this.errorHandler));
  }

  saveJob(job: Job): Observable<any> {
    return this.httpClient.post<any>(environment.LAPIG_JOBS + '/service/job/create', {job: job}, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Message: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
