import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private apiURL = `${environment.OWS}/api/download`;

  constructor(private httpClient: HttpClient) {}

  downloadRequest(parameters): Observable<Blob> {
    return this.httpClient.post(this.apiURL, parameters, { responseType: 'blob' })
  }

  downloadRequestSLD(layer): Observable<Blob> {
    const url = `${environment.OWS}/ows?request=GetStyles&layers=${layer}&service=wms&version=1.1.1`;
    return this.httpClient.get(url, { responseType: 'blob' })
  }
}
