import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { LocalizationService } from '../../../@core/internationalization/localization.service';
import { LangChangeEvent } from '@ngx-translate/core';
import { ContentHub } from '../../services/content-hub.service';

import { environment } from 'src/environments/environment';

import { Highlight, News } from '@core/interfaces';
import { catchError, ObservableInput } from 'rxjs';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexComponent implements AfterViewInit {
  public news: News[] = [];
  public highlights: Highlight[] = [];

  public player: any;
  public year = new Date().getFullYear();
  public reframed: Boolean = false;
  public theme = 'light';
  public checked = false;
  public scritps = ['https://www.youtube.com/iframe_api'];
  lang: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private localizationService: LocalizationService,
    private contentService: ContentHub
  ) {
    this.fetchNews();
    this.fetchHighlight();

    this.lang = this.localizationService.currentLang();
  }

  ngAfterViewInit(): void {
    this.localizationService.translateService.onLangChange.subscribe(
      (langChangeEvent: LangChangeEvent) => {
        this.lang = langChangeEvent.lang;

        this.fetchNews();
        this.fetchHighlight();
      }
    );

    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);
      if (currentTheme === 'dark') {
        this.checked = true;
      }
    }

    const firstScriptTag = document.getElementsByTagName('script')[0];

    for (let src of this.scritps) {
      const tag = document.createElement('script');
      tag.src = src;
      tag.type = 'text/javascript';
      // @ts-ignore
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    this.cdr.detectChanges();
  }

  /**
   * Recupera os elementos do *News*.
   */
  private fetchNews(): void {
    this.contentService.getNews().subscribe(news => {
      this.news = news;
    });
  }

  /**
   * Recupera os elementos do *Highlitght*.
   */
  private fetchHighlight(): void {
    this.contentService.getHighlights().subscribe((values: Map<String, any>) => {
      this.highlights = [];

      values.forEach((element) => {
        let fileUrl = JSON.parse(element.file as string)[0].download_link;

        this.highlights.push({
          title: element.title,
          image: environment.S3 + element.image,
          description: element.description,
          document: environment.S3 + fileUrl,
        });
      });
    });
  }
}
