import { Component, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { LocalizationService } from "../../../@core/internationalization/localization.service";
import { LangChangeEvent } from "@ngx-translate/core";
import { Team } from 'src/app/@core/interfaces/team';
import { IndexCard } from 'src/app/@core/interfaces/card';
import { DataAPI } from 'src/app/components/services/data.service';
import { Location } from '@angular/common';

declare var $;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements AfterViewInit {
  public team: Team[];
  public news: IndexCard[];
  public highlights: IndexCard[];

  public corouselOption: any;

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
  constructor(
    private cdr: ChangeDetectorRef,
    private localizationService: LocalizationService,
    private dataHotsite: DataAPI,
    private location: Location) {
    this.team = [];
    this.news = [];
    this.highlights = [];

    this.getTeam();
    this.getNews();
    this.getHighllights();

    this.lang = this.localizationService.currentLang();
  }

  ngAfterViewInit(): void {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.lang = langChangeEvent.lang;

      this.team = [];
      this.news = [];
      this.highlights = [];

      this.getTeam();
      this.getNews();
      this.getHighllights();
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

    console.log(firstScriptTag);

    for (let src of this.scritps) {
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

  private async getTeam() {
    await this.dataHotsite.getTeam().then(e => {
      console.log(e);
    })

    console.log("next");
    
    /*.subscribe(res => {
      Object.keys(res).forEach(key => {
        let element = res[key];
        this.team.push({ name: element.name, role: element.role, image: element.image, lattes: element.lattes });
      });
    });*/

    this.team = [
      {
      name: "Laerte Guimarães ferreira Júnior",
      role: "Coordinator",
      image: "team/June2023/IaHw6X0y030I3IRO1ZdB.jpeg",
      lattes: "http://lattes.cnpq.br/8647270006257055",
      },
      {
      name: "Claudinei O. dos Santos",
      role: "Researcher and Social and Environmental Analyst",
      image: "team/June2023/CcnPZKOU4CinwAKlEBea.jpeg",
      lattes: "http://lattes.cnpq.br/2396479143060437",
      },
      {
      name: "Leandro Leal Parente",
      role: "Researcher and Social and Environmental Analyst",
      image: "team/June2023/sFe6AN9U7R5VRkGIRLjI.jpeg",
      lattes: "http://lattes.cnpq.br/1371934085917576",
      }]
  }

  private getNews(): void {
    this.dataHotsite.getNews().subscribe(res => {
      Object.keys(res).forEach(key => {
        let element = res[key];
        this.news.push({ title: element.title, image: element.image, description: element.description, url: element.url });
      });
    });
  }

  private getHighllights(): void {
    this.dataHotsite.getHighlights().subscribe(res => {
      Object.keys(res).forEach(key => {
        let element = res[key];
        this.highlights.push({ title: element.title, image: element.image, description: element.description, url: element.url });
      });
    });
  }
}
