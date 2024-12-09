import { Component, OnInit } from '@angular/core';
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import { LangChangeEvent } from "@ngx-translate/core";
import { environment } from 'src/environments/environment';
import { ContentHub } from '../../services/content-hub.service';

import { Method } from '@core/interfaces';

@Component({
  selector: 'app-methods',
  templateUrl: './methods.component.html',
  styleUrls: ['./methods.component.css']
})
export class MethodsComponent implements OnInit {
  public methodologies: Method[] = [];

  public lang: string;

  constructor(
    private localizationService: LocalizationService,
    private contentHub: ContentHub) {
    this.fetchMethodologies();

    this.lang = this.localizationService.currentLang();
  }

  ngOnInit() {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.fetchMethodologies();
      this.lang = langChangeEvent.lang;
    });
  }

  /**
   * Recupera os elementos do *Methodologies*.
   */
  private fetchMethodologies(): void {
    this.contentHub.getMethodologies().subscribe(values => {
      this.methodologies = [];

      values.forEach((element: any) => {
        let fileUrl = JSON.parse(element.file as string)[0].download_link;

        this.methodologies.push(
          {
            title: element.title,
            image: environment.S3 + element.image,
            description: element.description,
            file: environment.S3 + fileUrl,
          });
      });
    })
  }
}
