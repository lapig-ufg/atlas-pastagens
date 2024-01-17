import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { LocalizationService } from 'src/app/@core/internationalization/localization.service';
import { ContatoService } from './ajuda.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { FAQ } from 'src/app/@core/interfaces/faq';
import { ContentHub } from '../../services/content-hub.service';

@Component({
  selector: 'app-ajuda',
  templateUrl: './ajuda.component.html',
  styleUrls: ['./ajuda.component.scss'],
  providers: [MessageService],
})
export class AjudaComponent implements OnInit {
  private faqs: FAQ[];

  private erroForm: boolean = false;

  constructor(
    private contentHub: ContentHub,
    private contatoService: ContatoService, 
    protected messageService: MessageService,
    public  localizationService: LocalizationService,
    private recaptchaV3Service: ReCaptchaV3Service) {
      this.fetchMethodologies();
    }

  ngOnInit() {
  }

  onSubmit(contactForm: NgForm) {
    this.recaptchaV3Service.execute('importantAction')
    .subscribe((token: string) => {
      if (contactForm.valid) {
        this.erroForm = false;
  
        const contact = contactForm.value;
        this.contatoService.saveContact(contact,token).subscribe((result) => {
          if(result.message === "sucess") {
            contactForm.reset();
            this.messageService.add({
              key: "contact-message",
              life: 2000,
              severity: 'success',
              summary: this.localizationService.translate('hotsite.contact.submit-message.success'),
              detail: this.localizationService.translate('hotsite.contact.submit-message.success')
            })
          }
        }, (error)=>{
          this.messageService.add({
            key: "contact-message",
            life: 2000,
            severity: 'error',
            summary: this.localizationService.translate('hotsite.contact.submit-message.fail'),
            detail: this.localizationService.translate('hotsite.contact.submit-message.fail')
          })
        });
      } else {
        this.erroForm = true;
      }
    });

    
  }

  private fetchMethodologies(): void {
    this.faqs = [];

    this.contentHub.getFAQs().subscribe(values => {
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
