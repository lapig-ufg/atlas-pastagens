import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { LocalizationService } from 'src/app/@core/internationalization/localization.service';
import { AjudaService } from './help.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ContentHub } from '../../services/content-hub.service';
import { LangChangeEvent } from '@ngx-translate/core';

import { FAQ } from '@core/interfaces';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  providers: [MessageService],
})

/**
 * Componente responsável pela guia de Ajuda.
 */
class HelpComponent implements OnInit {
  public faqs: FAQ[] = [];

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

  /**
   * Submete o formulário para o banco de dados.
   * 
   * @param {NgForm} contactForm 
   */
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

  /**
   * Recupera os elementos do FAQ.
   */
  private fetchFAQ(): void {
    this.contentHub.getFAQs().subscribe(values => {
      this.faqs = [];

      values.forEach((element: any) => {
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

export { HelpComponent };
