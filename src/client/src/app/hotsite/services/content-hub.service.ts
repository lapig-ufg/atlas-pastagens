import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LocalizationService } from '../../@core/internationalization/localization.service';
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})

/**
 * Service responsável por lidar com as requisições à API Content-Hub. 
 */
class ContentHub {
    private apiURL = environment.LAPIG_CONTENT_HUB + "/api";

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

    constructor(private httpClient: HttpClient, private  localizationService: LocalizationService) {}

    /**
     * Acessa os dados da tabela ***News*** do Content-Hub.
     * 
     * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***News***.
     */
    getNews(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get(this.apiURL + `/news/${lang}`, this.httpOptions);
    }

    /**
     * Acessa os dados da tabela ***Team*** do Content-Hub.
     * 
     * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***Team***.
     */
    getTeam(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get(this.apiURL + `/team/${lang}`, this.httpOptions);
    }

    /**
     * Acessa os dados da tabela ***Articles*** do Content-Hub.
     * 
     * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***Articles***.
     */
    getArticles(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get<any>(this.apiURL + `/articles/${lang}`, this.httpOptions);
    }

    /**
     * Acessa os dados da tabela ***Highlights*** do Content-Hub.
     * 
     * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***Highlights***.
     */
    getHighlights(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get<any>(this.apiURL + `/highlights/${lang}`, this.httpOptions);
    }

    /**
     * Acessa os dados da tabela ***Methodologies*** do Content-Hub.
     * 
     * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***Methodologie***.
     */
    getMethodologies(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get<any>(this.apiURL + `/methodologies/${lang}`, this.httpOptions);
    }

    /**
     * Acessa os dados da tabela ***FAQ*** do Content-Hub.
     * 
     * @returns {Observable<Array>} Observavel contendo uma lista de registros da tabela ***FAQ***.
     */
    getFAQs(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get<any>(this.apiURL + `/faq/${lang}`, this.httpOptions);
    }
}

export { ContentHub };
