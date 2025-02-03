import { Component, OnInit } from '@angular/core';
import { LangChangeEvent } from '@ngx-translate/core';
import { ContentHub } from '../../services/content-hub.service';
import { environment } from 'src/environments/environment';
import { LocalizationService } from 'src/app/@core/internationalization/localization.service';

import { Team } from '@core/interfaces';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutCompenent implements OnInit {
  public team: Team[] = [];

  constructor(
    private localizationService: LocalizationService,
    private contentHub: ContentHub,
  ) {
    this.fetchTeam();
  }

  ngOnInit() {
    this.localizationService.translateService.onLangChange.subscribe(
      (langChangeEvent: LangChangeEvent) => {
        this.fetchTeam();
      }
    );
  }

  /**
   * Recupera os elementos do *Team*.
   */
  private fetchTeam(): void {
    this.contentHub.getTeam().subscribe((values) => {
      this.team = [];

      values.forEach((element: any) => {
        this.team.push({
          name: element.name,
          image: environment.S3 + element.image,
          lattes: element.lattes,
          role: element.role,
        });
      });
    });
  }
}
