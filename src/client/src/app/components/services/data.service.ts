import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LocalizationService } from 'src/app/@core/internationalization/localization.service';
import { environment } from "../../../environments/environment";
import { SyncRequestClient } from 'ts-sync-request/dist'

@Injectable({
    providedIn: 'root'
})

export class DataAPI {
    private apiURL = environment.LAPIG_ADMIN;

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

    getNews(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get(this.apiURL + `/news/${lang}`, this.httpOptions);
    }

    getTeam(): Promise<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get<any>(this.apiURL + `/team/${lang}`, this.httpOptions).toPromise();
    }

    getArticles(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get<any>(this.apiURL + `/articles/${lang}`, this.httpOptions);
    }

    getHighlights(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get<any>(this.apiURL + `/highlights/${lang}`, this.httpOptions);
    }

    getMethodologies(): Observable<any> {
        let lang = this.localizationService.currentLang();
        return this.httpClient.get<any>(this.apiURL + `/methodologies/${lang}`, this.httpOptions);
    }
}
