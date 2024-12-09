import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { RegionFilterService } from './region-filter.service';
import { DescriptorType } from '@core/interfaces';

export { DownloadService };

@Injectable({
  providedIn: 'root',
})
class DownloadService {
  private apiURL = `${environment.OWS}/api/download`;
  private apiS3 = `${environment.LAPIG_DOWNLOAD_API}/api/download/`;

  constructor(
    private httpClient: HttpClient,
    private regionFilterService: RegionFilterService
  ) {}

  // TODO: Trazer o ErroMessageService para dentro do download.
  public downloadGeoFile(descriptorType: DescriptorType, fileType: string): Observable<any> {
    let regionFilter = this.regionFilterService.currentFilter;

    let params = {
      layer: descriptorType,
      region: regionFilter,
      filter: descriptorType.filters?.filter((filter) => descriptorType.filterSelected === filter.valueFilter)[0],
      typeDownload: fileType,
    };

    return this.httpClient.post(this.apiS3, params).pipe(
      map((response: any) => {
        if (response == null) throw new Error('Erro');

        window.open(response.url, '_blank');

        return {status: 'success'}
      })
    ).pipe(
      catchError(error => this.errorHandlerS3(error)));
  }

  public downloadRequest(parameters: any): Observable<Blob> {
    return this.httpClient.post(this.apiURL, parameters, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
      }),
      responseType: 'blob',
    });
  }

  public downloadRequestSLD(layer: any): Observable<Blob> {
    const url = `${environment.OWS}/ows?request=GetStyles&layers=${layer}&service=wms&version=1.1.1`;

    return this.httpClient.get(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
      }),
      responseType: 'blob',
    });
  }

  private errorHandlerS3(error: any) {
    const error_types = ['unable_filter_layer', 'file_empty', 'file_not_found']

    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error_types.includes(error.error.message)) {
      errorMessage = 'left_sidebar.layer.s3_' + error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return of({ status: 'error', message: errorMessage });
  }
}
