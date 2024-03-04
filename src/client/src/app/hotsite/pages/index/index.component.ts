import { Component, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import { LangChangeEvent } from "@ngx-translate/core";
import { ContentHub } from '../../services/content-hub.service';
import { Team } from 'src/app/@core/interfaces/team';
import { Highlight } from 'src/app/@core/interfaces/highlights';
import { environment } from 'src/environments/environment';
import { News } from 'src/app/@core/interfaces/news';

declare var $;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements AfterViewInit {

  public news: News[];
  public highlights: Highlight[];

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
    this.fetchNews();
    this.fetchHighlight();

    this.lang = this.localizationService.currentLang();
  }

  ngAfterViewInit(): void {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.fetchNews();
      this.fetchHighlight();

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

  private fetchNews(): void {
    this.contentHub.getNews().subscribe(values => {
      this.news = [];

      values.forEach(element => {
        this.news.push(
          {
            title: element.title,
            description: element.description,
            image: environment.S3 + element.image,
            url: element.url,
          });
      });
    })
  }

  private fetchHighlight(): void {
    this.contentHub.getHighlights().subscribe(values => {
      this.highlights = [];

      values.forEach(element => {
        let fileUrl = JSON.parse(element.file as string)[0].download_link;

        this.highlights.push(
          {
            title: element.title,
            image: environment.S3 + element.image,
            description: element.description,
            document: environment.S3 + fileUrl,
          });
      });
    })
  }
}
