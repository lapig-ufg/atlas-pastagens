import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { LocalizationService } from 'src/app/@core/internationalization/localization.service';
import { AjudaService } from './ajuda.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { FAQ } from 'src/app/@core/interfaces/faq';
import { ContentHub } from '../../services/content-hub.service';
import { LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-ajuda',
  templateUrl: './ajuda.component.html',
  styleUrls: ['./ajuda.component.scss'],
  providers: [MessageService],
})
export class AjudaComponent implements OnInit {
  public faqs: FAQ[];

  private erroForm: boolean = false;

  constructor(
    private contentHub: ContentHub,
    private ajudaService: AjudaService,
    protected messageService: MessageService,
    public localizationService: LocalizationService,
    private recaptchaV3Service: ReCaptchaV3Service) {
    this.fetchFAQ();
  }

  ngOnInit() {
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.fetchFAQ();
    });
  }

  onSubmit(contactForm: NgForm) {
    this.recaptchaV3Service.execute('importantAction')
      .subscribe((token: string) => {
        if (contactForm.valid) {
          this.erroForm = false;

          const contact = contactForm.value;
          this.ajudaService.saveContact(contact, token).subscribe((result) => {
            if (result.message === "sucess") {
              contactForm.reset();
              this.messageService.add({
                key: "contact-message",
                life: 2000,
                severity: 'success',
                summary: this.localizationService.translate('hotsite.help.form.submit.success'),
                detail: this.localizationService.translate('hotsite.help.form.submit.success')
              })
            }
          }, (error) => {
            this.messageService.add({
              key: "contact-message",
              life: 2000,
              severity: 'error',
              summary: this.localizationService.translate('hotsite.help.form.submit.fail'),
              detail: this.localizationService.translate('hotsite.help.form.submit.fail')
            })
          });
        } else {
          this.erroForm = true;
        }
      });
  }

  private fetchFAQ(): void {
    this.contentHub.getFAQs().subscribe(values => {
      this.faqs = [];
      
      values.forEach(element => {
        this.faqs.push(
          {
            sequence: element.sequence,
            question: element.question,
            answer: element.answer,
          });
      });
    })
  }

  getErroForm(): boolean {
    return this.erroForm;
  }
}
