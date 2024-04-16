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

/**
 * Componente responsável pela guia de Ajuda.
 */
class AjudaComponent implements OnInit {
  public faqs: FAQ[];

  public isFormValid: boolean = true;

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
    if (!this.validateForm(contactForm)) return;

    this.recaptchaV3Service.execute('importantAction')
      .subscribe((token: string) => {
        this.ajudaService.saveContact(contactForm.value, token).subscribe((result) => {
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
          // TODO: Registrar erro em log.
          this.messageService.add({
            key: "contact-message",
            life: 2000,
            severity: 'error',
            summary: this.localizationService.translate('hotsite.help.form.submit.fail'),
            detail: this.localizationService.translate('hotsite.help.form.submit.fail')
          })
        });
      });
  }

  /**
   * Valida o formulário submetido.
   * 
   * @param {NgForm} contactForm - Formulário submetido.
   * @returns Retorna *true* quando o formulário é válido e *false* caso contrario.
   */
  private validateForm(contactForm: NgForm): boolean {
    this.isFormValid = contactForm.valid!;
    return contactForm.valid!
  }

  /**
   * Recupera os elementos do FAQ e armazena na propriedade *faqs*.
   */
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

  /**
   * Get para a pripriedade privada *isFormValid*.
   * 
   * @returns Retorna a proprieda privada *isFormValid*.
   */
  getFormValidation(): boolean {
    return !this.isFormValid;
  }
}

export { AjudaComponent };
