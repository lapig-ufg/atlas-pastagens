import { Component, OnInit } from '@angular/core';
import { LangChangeEvent } from '@ngx-translate/core';
import { Team } from 'src/app/@core/interfaces/team';
import { ContentHub } from '../../services/content-hub.service';
import { environment } from 'src/environments/environment';
import { LocalizationService } from 'src/app/@core/internationalization/localization.service';


@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.component.html',
  styleUrls: ['./sobre.component.css']
})
export class SobreComponent implements OnInit {

  public team: Team[];

  constructor(private localizationService: LocalizationService, private contentHub: ContentHub) {
    this.featchTeam();
  }

  ngOnInit() {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.featchTeam();
    });
  }

  private featchTeam(): void {
    this.team = [];

    this.contentHub.getTeam().subscribe(values => {
      values.forEach(element => {
        this.team.push(
          {
            name: element.name,
            image: environment.S3 + element.image,
            lattes: element.lattes,
            role: element.role});
      });
    })
  }
}
