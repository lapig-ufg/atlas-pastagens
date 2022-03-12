import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private apiURL = `${environment.OWS}/api/download`;

  constructor(private httpClient: HttpClient) {}

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
}
