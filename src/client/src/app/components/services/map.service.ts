import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { of } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private apiURL = '/service/map';

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

  getDescriptor(lng): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/descriptor?lang=' + lng)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler),
    );
  }

  getExtent(region): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/extent', { params: MapService.PARAMS.set("key", region.value).append("type", region.type) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getFeatures(url): Observable<any> {
    return this.httpClient.get<any>(url)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getRegionLabels(url): Observable<any> {
    return this.httpClient.get<any>(url)
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  search(term): Observable<any> {
    if (term === "") {
      return of([]);
    }

    return this.httpClient.get<any>(this.apiURL + '/search', { params: MapService.PARAMS.set("key", term) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  downloadSHP(parameters): Observable<Blob> {
    return this.httpClient.post(this.apiURL + "/download/shp", parameters, { responseType: 'blob' })
  }

  downloadCSV(parameters): Observable<Blob> {
    return this.httpClient.post(this.apiURL + "/download/csv", parameters, { responseType: 'blob' })
  }

  getRegions(term: string): Observable<any> {
    if (term === "") {
      return of([]);
    }

    return this.httpClient.get<any>(this.apiURL + '/search', { params: MapService.PARAMS.set("key", term) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getCARS(term: string): Observable<any> {

    return this.httpClient.get<any>(this.apiURL + '/cars', { params: MapService.PARAMS.set("key", term) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));
  }

  getUCs(term: string): Observable<any> {

    if (term === "") {
      return of([]);
    }

    return this.httpClient.get<any>(this.apiURL + '/ucs', { params: MapService.PARAMS.set("key", term) })
      .pipe(map(response => response))
      .pipe(catchError(this.errorHandler));

  }

  getRegionByGeocodigo(term: string): Observable<any[]> {

    return this.httpClient.get<any>(this.apiURL + '/cdgeocmu', { params: MapService.PARAMS.set("key", term) })
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
