import { Component, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import { LangChangeEvent } from "@ngx-translate/core";
import { ContentHub } from '../../services/content-hub.service';
import { Team } from 'src/app/@core/interfaces/team';

declare var $;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements AfterViewInit {

  public team: Team[];

  public video: any;
  public player: any;
  public year = (new Date()).getFullYear();
  public reframed: Boolean = false;
  public theme = 'light'
  public checked = false;
  public scritps = [
    'https://www.youtube.com/iframe_api'
  ];
  lang: string;

  @ViewChild('owl') owl: ElementRef;
  constructor(private cdr: ChangeDetectorRef, private localizationService: LocalizationService, private contentHub: ContentHub) {
    this.featchTeam();

    this.lang = this.localizationService.currentLang();
  }

  ngAfterViewInit(): void {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.featchTeam();
      this.lang = langChangeEvent.lang;
    });

    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);
      if (currentTheme === 'dark') {
        this.checked = true;
      }
    }

    this.video = 'ZZnHtkblmro';

    const firstScriptTag = document.getElementsByTagName('script')[0];

    for (let src of this.scritps) {
      const tag = document.createElement('script');
      tag.src = src
      tag.type = 'text/javascript';
      // @ts-ignore
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    this.cdr.detectChanges();
  }

  private featchTeam(): void {
    this.team = [];

    this.contentHub.getTeam().subscribe(values => {
      values.forEach(element => {
        this.team.push(
          {
            name: element.name,
            image:"https://s3.lapig.iesa.ufg.br/storage/" + element.image,
            lattes: element.lattes,
            role: element.role});
      });
    })
  }
}
