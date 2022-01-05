import {Component, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {Router} from "@angular/router";
import {LocalizationService} from "../../../@core/internationalization/localization.service";

@Component({
  selector: 'app-site-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements  AfterViewInit {


  public year = (new Date()).getFullYear();
  public theme = 'light'
  public checked = false;
  public menu: Menu[];
  public lang: string;


  constructor(private cdr: ChangeDetectorRef, private router: Router,   private localizationService: LocalizationService, ) {
    this.initMenu();
  }
  initMenu(){
    this.menu = [
      {
        key: "home",
        title: 'Home',
        href: "/",
        selected: true
      },
      {
        key: "about",
        title: this.localizationService.translate('hotsite.base.header.menu.about'),
        href: "/sobre",
        selected: false
      },
      {
        key: "methods",
        title: this.localizationService.translate('hotsite.base.header.menu.methods'),
        href: "/metodos",
        selected: false
      },
      {
        key: "articles",
        title: this.localizationService.translate('hotsite.base.header.menu.articles'),
        href: "/artigos",
        selected: false
      },
      {
        key: "gallery",
        title: this.localizationService.translate('hotsite.base.header.menu.gallery'),
        href: "/galeria",
        selected: false
      }
    ];
  }

  ngAfterViewInit(): void {
    this.lang = this.localizationService.currentLang();
    this.menu.forEach(itemMenu => {
      if(this.router.url === itemMenu.href){
        itemMenu.selected = true;
      }else{
        itemMenu.selected = false;
      }
    })
    // @ts-ignore
    document.getElementById("movetop").style.display = "none";
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);

      if (currentTheme === 'dark') {
       this.checked = true;
      }
    }

    this.cdr.detectChanges();

    const self = this;

    window.onscroll = function () {
      self.scrollFunction()
    };

  }

  handleLang(lang){
    localStorage.setItem('lang', lang);
    this.localizationService.useLanguage(lang).then(result => {
      this.lang = lang;
      this.menu.forEach(item => {
       item.title = this.localizationService.translate('hotsite.base.header.menu.' + item.key);
      })
    });
  }

  switchTheme(e) {
    this.checked = !this.checked;
    if (this.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      this.checked = true;
    }
    else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      this.checked = false;
    }
  }

  scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      // @ts-ignore
      document.getElementById("movetop").style.display = "block";
    } else {
      // @ts-ignore
      document.getElementById("movetop").style.display = "none";
    }
  }
}

export interface Menu {
  key: string;
  title: string;
  href: string;
  selected: boolean;
}
