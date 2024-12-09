/**
 * Angular imports.
 */
import { Component, ChangeDetectorRef } from '@angular/core';
import { AfterContentChecked } from '@angular/core';

import { LocalizationService } from '../../../@core/internationalization/localization.service';
import { Menu } from '@core/interfaces';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterContentChecked {
  public lang: string = 'pt';

  public menus: Array<Menu> = [
    {
      key: 'layers',
      icon: 'fg-layers',
      show: false,
    },
    {
      key: 'statistics',
      icon: 'bx bx-bar-chart-alt',
      show: false,
    },
    {
      key: 'area',
      icon: 'fg-polygon-hole-pt',
      show: false,
    },
    {
      key: 'options',
      icon: 'fg-map-options-alt',
      show: false,
    },
  ];

  public COMMIT_ID = `Build: ${environment.COMMIT_ID}`;

  constructor(
    private localizationService: LocalizationService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  public onMenuClick(menu: Menu): void {
    menu.show = !menu.show;

    if (menu.key === 'statistics') return;

    this.menus.forEach((element: Menu) => {
      if (element.key === 'statistics') return;
      if (element.key === menu.key) return;
      element.show = false;
    });
  }

  public onRightSidebarClose(): void {
    this.menus[1].show = false;
  }

  public onLeftSidebarClose(): void {
    this.menus[0].show = false;
    this.menus[2].show = false;
    this.menus[3].show = false;
  }

  public isLeftSidebarToggle(): boolean {
    return !this.menus.every((element: Menu) => {
      if (element.key === 'statistics') return true;
      return !element.show;
    });
  }

  public isRightSidebarToggle(): boolean {
    return this.menus.find((element: Menu) => {
      return element.key === 'statistics';
    })!.show;
  }

  public changeLanguage(lang: string): void {
    this.lang = lang;

    this.localizationService.useLanguage(lang);
  }
}
