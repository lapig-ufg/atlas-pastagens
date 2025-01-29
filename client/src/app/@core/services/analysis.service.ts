import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserInfo } from '@core/interfaces/user_info';

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  private apiURL = '/service/upload';

  static PARAMS = new HttpParams({
    fromObject: {
      format: 'json',
    },
  });

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) {}

  public getAnalysisByToken(token: any): Observable<any> {
    return this.httpClient
      .get<any>(`${environment.TASK_API}/result/${token}`)
      .pipe(map((response) => response))
  }

  // TODO: Verificação do recaptcha.
  public saveGeojson(
    user: UserInfo,
    geoJson: any,
    recaptcha: string
  ): Observable<any> {
    return this.httpClient
      .post<any>(
        `${this.apiURL}/savegeom`,
        {
          user: {
            name: user.name,
            email: user.email,
          },
          geojson: geoJson,
        },
        {
          headers: new HttpHeaders({
            'Recaptcha-Token': recaptcha,
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(
        map((response: any) => {
          if (response == null) throw new Error('Erro');

          console.log(response);

          return response;
        })
      );
  }

  // TODO: Verificação do recaptcha.
  public saveFile(file, user: UserInfo, recaptcha: string) {
    const formData = new FormData();

    formData.append('files', file, file.name);
    formData.append('name', encodeURIComponent(user.name));
    formData.append('email', encodeURIComponent(user.email));

    return this.httpClient.post<any>(`${this.apiURL}/savefile`, formData).pipe(
      map((response: any) => {
        console.log(response);
      })
    );
  }
}
