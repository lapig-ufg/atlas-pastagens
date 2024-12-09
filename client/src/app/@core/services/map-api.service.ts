import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { LocalizationService } from '@core/internationalization/localization.service';
import { environment } from 'src/environments/environment';
import { DescriptorType } from '@core/interfaces';

export { MapAPIService };

const API_URL = '/service/map';

@Injectable({
  providedIn: 'root'
})
class MapAPIService {
  public PARAMS = new HttpParams({
    fromObject: {
      format: "json"
    }
  });

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient, private localizationService: LocalizationService) {}

  public getMunicipalitiesAtributes(): any {
    const url = `${environment.OWS_API}/map/layerfromname?lang=${this.localizationService.currentLang()}&layertype=municipios_info`;

    return this.httpClient.get(url).pipe(map(response => {
      let descriptorType: DescriptorType = response as DescriptorType

      return descriptorType.wfsMapCard.attributes
    })).pipe(catchError(this.errorHandler));
  }

  public getExtent(region: any): Observable<any> {
    return this.httpClient.get<any>(API_URL + '/extent', { params: this.PARAMS.set("key", region.value).append("type", region.type) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  public getFeatures(url: any): Observable<any> {
    return this.httpClient.get<any>(url)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  public getRegionLabels(url: any): Observable<any> {
    return this.httpClient.get<any>(url)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  public search(term: any): Observable<any> {
    if (term === "") {
      return of([]);
    }

    return this.httpClient.get<any>(API_URL + '/search', { params: this.PARAMS.set("key", term) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  public downloadSHP(parameters: any): Observable<Blob> {
    return this.httpClient.post(API_URL + "/download/shp", parameters, { responseType: 'blob' })
  }

  public downloadCSV(parameters: any): Observable<Blob> {
    return this.httpClient.post(API_URL + "/download/csv", parameters, { responseType: 'blob' })
  }

  public getRegions(term: string): Observable<any> {
    if (term === "") {
      return of([]);
    }

    return this.httpClient.get<any>(API_URL + '/search', { params: this.PARAMS.set("key", term) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  public getCARS(term: string): Observable<any> {
    return this.httpClient.get<any>(API_URL + '/cars', { params: this.PARAMS.set("key", term) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  public getUCs(term: string): Observable<any> {
    if (term === "") {
      return of([]);
    }

    return this.httpClient.get<any>(API_URL + '/ucs', { params: this.PARAMS.set("key", term) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));

  }

  public getRegionByGeocodigo(term: string): Observable<any[]> {
    return this.httpClient.get<any>(API_URL + '/cdgeocmu', { params: this.PARAMS.set("key", term) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  private errorHandler(error: any) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(errorMessage);
  }
}
