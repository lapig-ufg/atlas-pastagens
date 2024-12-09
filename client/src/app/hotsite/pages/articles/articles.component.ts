import { Component, OnInit } from '@angular/core';
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import { LangChangeEvent } from "@ngx-translate/core";
import { ContentHub } from '../../services/content-hub.service';
import { environment } from 'src/environments/environment';

import { Article } from '@core/interfaces';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {

  public search: string = '';

  public articles: Article[] = [];

  constructor(private localizationService: LocalizationService, private contentHub: ContentHub) {
    this.fetchArticles();
  }

  ngOnInit() {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.fetchArticles();
    });
  }

  private fetchArticles(): void {
    this.contentHub.getArticles().subscribe(values => {
      this.articles = [];

      values.forEach((article: any) => {
        this.articles.push(
          {
            title: article.title,
            abstract: article.abstract,
            doi: article.doi,
            authors: article.authors,
            published: article.published,
            image: environment.S3 + article.image,
          });
      });

      this.articles = this.articles.sort((a, b) => (a.published > b.published) ? -1 : 1);
    });
  }
}