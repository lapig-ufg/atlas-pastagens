import { Component, OnInit } from '@angular/core';
import {LocalizationService} from "../../../@core/internationalization/localization.service";
import {LangChangeEvent} from "@ngx-translate/core";
import { Methodology } from 'src/app/@core/interfaces/methodology';
import { environment } from 'src/environments/environment';
import { ContentHub } from '../../services/content-hub.service';

@Component({
  selector: 'app-metodos',
  templateUrl: './metodos.component.html',
  styleUrls: ['./metodos.component.css']
})
export class MetodosComponent implements OnInit {
  public methodologies: Methodology[];
  
  public lang: string;

  constructor(private localizationService: LocalizationService, private contentHub: ContentHub) {
    this.featchMethodologies();

    this.lang = this.localizationService.currentLang();
  }

  ngOnInit() {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.lang = langChangeEvent.lang;
    });
  }

  private featchMethodologies(): void {
    this.methodologies = [];

    this.contentHub.getMethodologies().subscribe(values => {
      values.forEach(element => {
        this.methodologies.push(
          {
            title: element.title,
            image: environment.S3 + element.image,
            description: element.description,
            file: element.file,
          });
      });
    })
  }
}
