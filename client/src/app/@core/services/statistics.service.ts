/**
 * Angular imports.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Rxjs imports.
 */
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Interfaces imports.
 */
import { RegionFilter } from '@core/interfaces';
import { LocalizationService } from '@core/internationalization/localization.service';

@Injectable({
  providedIn: 'root',
})
class StatisticsService {
  private apiURL = '/service/charts';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private httpClient: HttpClient,
    private localizationService: LocalizationService
  ) {}

  /**
   * Get StatisticsSidebar charts.
   * @param chart Chart name.
   * @param regionFilter
   * @param year
   * @returns
   */
  public getSummary(chart: string, regionFilter: RegionFilter, year: string): Observable<any> {
    let params: string =
      `lang=${this.localizationService.currentLang()}` +
      `&typeRegion=${regionFilter.type}` +
      `&valueRegion=${regionFilter.value}` +
      `&textRegion=${regionFilter.text}` +
      `&card_resume=${chart}` +
      `&year=${year}`;

    return this.httpClient
      .get<any>(`${this.apiURL}/resumo?${params}`, this.httpOptions)
      .pipe(map((response) => response))
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Get pasture graphs.
   * @param regionFilter
   * @returns
   */
  public getPastureGraph(regionFilter: RegionFilter): Observable<any> {
    let params =
      `lang=${this.localizationService.currentLang()}` +
      `&typeRegion=${regionFilter.type}` +
      `&valueRegion=${regionFilter.value}` +
      `&textRegion=${regionFilter.text}`;

    return this.httpClient
      .get<any>(`${this.apiURL}/pastureGraph?${params}`, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Get ranking tables.
   * @param regionFilter
   * @param year
   * @returns
   */
  public getRankingTables(regionFilter: RegionFilter, year: string): Observable<any> {
    let params =
      `lang=${this.localizationService.currentLang()}` +
      `&typeRegion=${regionFilter.type}` +
      `&valueRegion=${regionFilter.value}` +
      `&textRegion=${regionFilter.text}` +
      `&year=${year}`;

    return this.httpClient
      .get<any>(`${this.apiURL}/areatable?${params}`, this.httpOptions)
      .pipe(map((response) => response))
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

export { StatisticsService as ChartService };
