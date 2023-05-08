import {Component, ElementRef, ViewChild,ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {LocalizationService} from "../../../@core/internationalization/localization.service";
import {LangChangeEvent} from "@ngx-translate/core";
import { Card } from 'primeng/card';
import { Collaborator } from 'src/app/@core/interfaces/collaborator';
import { IndexCard } from 'src/app/@core/interfaces/card';

declare var $;



@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements  AfterViewInit {
  public news: IndexCard[];
  public featured: IndexCard[];
  public team: Collaborator[];

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
  constructor(private cdr: ChangeDetectorRef, private localizationService: LocalizationService) {
    this.lang = this.localizationService.currentLang();
  }

  ngAfterViewInit(): void {
    this.news = [];
    this.featured = [];
    this.team = [];

    this.getNews();
    this.getFeatured();

    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
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

    for(let src of this.scritps){
      const tag = document.createElement('script');
      tag.src = src
      tag.type = 'text/javascript';
      // @ts-ignore
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    this.cdr.detectChanges();
    $(this.owl.nativeElement).owlCarousel({
      loop: true,
      nav: false,
      margin: 15,
      stagePadding: 20,
      responsiveClass: true,
      autoplay: true,
      autoplayTimeout: 3000,
      autoplaySpeed: 1000,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1,
          nav: false
        },
        736: {
          items: 1,
          nav: false
        },
        991: {
          items: 2,
          margin: 30,
          nav: false
        },
        1080: {
          items: 4,
          nav: false
        }
      }
    })
  }

  private getNews(): void {
    this.news = [
      { title: "hotsite.home.emphasis.pasture.title",
        image: "../../../../assets/hotsite/images/pastagem.png",
        description: "hotsite.home.emphasis.pasture.text",
        url: "/Área%20de%20Pastagem.pdf"}
    ]
  }

  private getFeatured(): void {
    this.featured = [
      { title: "hotsite.home.emphasis.pasture.title",
        image: '../../../../assets/hotsite/images/pastagem.png',
        description: "hotsite.home.emphasis.pasture.text",
        url: "/Área%20de%20Pastagem.pdf"},
      { title: "hotsite.home.emphasis.pasture_quality.title",
        image: '../../../../assets/hotsite/images/qualidade_pastagem.png',
        description: 'hotsite.home.emphasis.pasture_quality.text',
        url: "/Qualidade%20de%20Pastagem.pdf"},
      { title: "hotsite.home.emphasis.carbon_stock.title",
        image: '../../../../assets/hotsite/images/estoque.png',
        description: "hotsite.home.emphasis.carbon_stock.text",
        url: "/Estoque%20de%20carbono.pdf"}
      ]
  }

  private getTeam(): void {
    
  }
}
