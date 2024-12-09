import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LocalizationService } from '../../@core/internationalization/localization.service';
import { environment } from '../../../environments/environment';
import { News } from '@core/interfaces';
import { LangChangeEvent } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})

/**
 * Service responsável por lidar com as requisições à API Content-Hub.
 */
class ContentService {
  private lang: string;

  private apiURL = environment.LAPIG_CONTENT_HUB + '/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private httpClient: HttpClient,
    private localizationService: LocalizationService
  ) {
    this.lang = this.localizationService.currentLang();

    this.localizationService.translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.lang = event.lang;
      }
    );
  }

  /**
   * Acessa os dados da tabela ***News*** do Content-Hub.
   *
   * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***News***.
   */
  getNews(): Observable<News[]> {
    let observable = new Observable<News[]>((subscribe) => {
      this.httpClient
        .get(this.apiURL + `/news/${this.lang}`, this.httpOptions)
        .subscribe((response: Object) => {
          let elements: News[] = [];

          Object.values(response).forEach((element: any) => {
            elements.push({
              title: element.title,
              description: element.description,
              image: environment.S3 + element.image,
              url: element.url,
            });
          });

          subscribe.next(elements);
        });
    });

    return observable;
  }

  /**
   * Acessa os dados da tabela ***Team*** do Content-Hub.
   *
   * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***Team***.
   */
  getTeam(): Observable<any> {
    return this.httpClient.get(this.apiURL + `/team/${this.lang}`, this.httpOptions);
  }

  /**
   * Acessa os dados da tabela ***Articles*** do Content-Hub.
   *
   * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***Articles***.
   */
  getArticles(): Observable<any> {
    return this.httpClient.get<any>(
      this.apiURL + `/articles/${this.lang}`,
      this.httpOptions
    );
  }

  /**
   * Acessa os dados da tabela ***Highlights*** do Content-Hub.
   *
   * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***Highlights***.
   */
  getHighlights(): Observable<any> {
    return this.httpClient.get<any>(
      this.apiURL + `/highlights/${this.lang}`,
      this.httpOptions
    );
  }

  /**
   * Acessa os dados da tabela ***Methodologies*** do Content-Hub.
   *
   * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***Methodologie***.
   */
  getMethodologies(): Observable<any> {
    return this.httpClient.get<any>(
      this.apiURL + `/methodologies/${this.lang}`,
      this.httpOptions
    );
  }

  /**
   * Acessa os dados da tabela ***FAQ*** do Content-Hub.
   *
   * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***FAQ***.
   */
  getFAQs(): Observable<any> {
    return this.httpClient.get<any>(
      this.apiURL + `/faq/${this.lang}`,
      this.httpOptions
    );
  }
}

export { ContentService as ContentHub };
