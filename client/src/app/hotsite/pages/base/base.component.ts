import { Router } from '@angular/router';
import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';


import { LocalizationService } from '../../../@core/internationalization/localization.service';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-site-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent implements AfterViewInit {
  public year = new Date().getFullYear();
  public theme = 'light';
  public checked = false;
  public menu: Menu[] = [];
  public lang: string = '';
  public COMMIT_ID = `Build: ${environment.COMMIT_ID}`;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private localizationService: LocalizationService
  ) {
    this.initMenu();
  }

  initMenu() {
    let menuNames: Array<string> = [
      'home',
      'about',
      'methods',
      'articles',
      'gallery',
      'help',
    ];

    this.menu = menuNames.map((name) => {
      return {
        key: name,
        title: this.localizationService.translate(
          `hotsite.base.header.menu.${name}` 
        ),
        href: `/${name}`,
        selected: false,
      }
    });
  }

  ngAfterViewInit(): void {
    this.lang = this.localizationService.currentLang();
    this.menu.forEach((itemMenu) => {
      if (this.router.url === itemMenu.href) {
        itemMenu.selected = true;
      } else {
        itemMenu.selected = false;
      }
    });
    // @ts-ignore
    document.getElementById('movetop').style.display = 'none';
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
      self.scrollFunction();
    };
  }

  handleLang(lang: string) {
    localStorage.setItem('lang', lang);

    this.localizationService.useLanguage(lang).then((result) => {
      this.lang = lang;
      this.menu.forEach((item) => {
        item.title = this.localizationService.translate(
          'hotsite.base.header.menu.' + item.key
        );
      });
    });
  }

  scrollFunction() {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      // @ts-ignore
      document.getElementById('movetop').style.display = 'block';
    } else {
      // @ts-ignore
      document.getElementById('movetop').style.display = 'none';
    }
  }
}

interface Menu {
  key: string;
  title: string;
  href: string;
  selected: boolean;
}
