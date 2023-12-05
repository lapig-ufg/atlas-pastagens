import { Component, OnInit } from '@angular/core';
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import { LangChangeEvent } from "@ngx-translate/core";
import { ContentHub } from '../../services/content-hub.service';
import { environment } from 'src/environments/environment';
import { Article } from 'src/app/@core/interfaces/article';

@Component({
  selector: 'app-artigos',
  templateUrl: './artigos.component.html',
  styleUrls: ['./artigos.component.scss']
})
export class ArtigosComponent implements OnInit {

  search: string;

  articles: Article[];

  constructor(private localizationService: LocalizationService, private contentHub: ContentHub) {
    this.fetchArticles();
  }

  ngOnInit() {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.fetchArticles();
    });
  }

  private fetchArticles(): void {
    this.articles = [];

    this.contentHub.getArticles().subscribe(values => {
      values.forEach(article => {
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