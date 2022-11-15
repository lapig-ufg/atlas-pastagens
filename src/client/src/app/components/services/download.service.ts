import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private apiURL = `${environment.OWS}/api/download`;
  private apiS3 = `${environment.LAPIG_DOWNLOAD_API}/api/download`;
  constructor(private httpClient: HttpClient) {}

  
  downloadFromS3(parameters): Observable<any>{
    return this.httpClient.post<any>(this.apiS3, parameters)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  downloadRequest(parameters): Observable<Blob> {
    return this.httpClient.post(this.apiURL, parameters, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'
      }),
      responseType: 'blob'
    });
  }

  downloadRequestSLD(layer): Observable<Blob> {
    const url = `${environment.OWS}/ows?request=GetStyles&layers=${layer}&service=wms&version=1.1.1`;
    return this.httpClient.get(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'
      }),
      responseType: 'blob'
    })
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
