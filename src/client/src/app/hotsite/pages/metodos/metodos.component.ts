import { Component, OnInit } from '@angular/core';
import {LocalizationService} from "../../../@core/internationalization/localization.service";
import {LangChangeEvent} from "@ngx-translate/core";
import { DataAPI } from 'src/app/components/services/data.service';
import { Methodology } from 'src/app/@core/interfaces/methodology';

@Component({
  selector: 'app-metodos',
  templateUrl: './metodos.component.html',
  styleUrls: ['./metodos.component.css']
})
export class MetodosComponent implements OnInit {
  public methodologies: Methodology[];

  lang: string;

  constructor(private localizationService: LocalizationService, private dataHotsite: DataAPI) {
    this.methodologies = [];

    this.getMethodologies();

    this.lang = this.localizationService.currentLang();
  }

  ngOnInit() {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.lang = langChangeEvent.lang;
    });
  }

  private getMethodologies(): void {
    this.dataHotsite.getMethodologies().subscribe(res => {
      Object.keys(res).forEach(key => {
        let element = res[key];
        this.methodologies.push({ title: element.title, description: element.description, image: element.image, file: element.file });
      });
    });
  }
}
