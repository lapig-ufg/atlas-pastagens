import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { error } from 'console';
import { MessageService } from 'primeng/api';
//import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import { LocalizationService } from 'src/app/@core/internationalization/localization.service';
import { ContatoService } from './contato.service';

@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.scss'],
  providers: [MessageService],
})
export class ContatoComponent implements OnInit {
  private erroForm: boolean = false;

  constructor(
    private contatoService: ContatoService, 
    protected messageService: MessageService,
    public  localizationService: LocalizationService) {
    }

  ngOnInit() {
  }

  onSubmit(contactForm: NgForm) {
    if (contactForm.valid) {
      this.erroForm = false;

      const contact = contactForm.value;
      contact.status = "RECEIVED";
      this.contatoService.saveContact(contactForm.value).subscribe((result) => {
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
  }

  getErroForm(): boolean {
    return this.erroForm;
  }
}
