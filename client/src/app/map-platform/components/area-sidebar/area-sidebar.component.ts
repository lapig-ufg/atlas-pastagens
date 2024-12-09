import { Component, Input, ViewChild } from '@angular/core';

/**
 * Services imports.
 */
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnalysisService, GoogleAnalyticsService } from '../../../@core/services';
import { LocalizationService } from '@core/internationalization/localization.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

import { UserInfoComponent } from '@core/components/user-info-dialog/user-info-dialog.component';

@Component({
  selector: 'app-area-sidebar',
  templateUrl: './area-sidebar.component.html',
  styleUrls: ['./area-sidebar.component.scss'],
})
class AreaSidebarComponent {
  @ViewChild(UserInfoComponent) userInfoComponent!: UserInfoComponent;

  @Input() lang!: string;

  public userInput: string = '';

  public httpOptions: any;

  public displayTutorial: boolean = false;
  public tutorialUrl: SafeResourceUrl;

  public emailValid: boolean = true;
  public data: any = {};
  public objectFullScreenChart: any = {};

  public isMobile: boolean =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent
    );

  constructor(
    private analysisService: AnalysisService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private router: Router,
    public localizationService: LocalizationService,
    private sanitizer: DomSanitizer,
    public route: ActivatedRoute
  ) {
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    this.tutorialUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'src/assets/documents/' +
        this.localizationService.currentLang() +
        '/tutorial.pdf'
    );
  }

  ngOnInit(): void {}

  public clearInput() {
    this.userInput = '';
  }

  public clearUpload(fromConsulta = false) {}

  public openTutorial() {
    this.tutorialUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'assets/documents/' +
        this.localizationService.currentLang() +
        '/tutorial.pdf'
    );
    this.displayTutorial = !this.displayTutorial;
  }

  public onAnalyseClicked() {
    this.router.navigate([`/analysis/${this.userInput}`])
  }

  private validationMobile() {
    return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent
    );
  }
}

export { AreaSidebarComponent };
