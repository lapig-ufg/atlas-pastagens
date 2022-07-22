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

  constructor(
    private contatoService: ContatoService, 
    protected messageService: MessageService,
    public  localizationService: LocalizationService) { 

    }

  ngOnInit() {
  }

  onSubmit(contactForm: NgForm) {
    if (contactForm.valid) {
      const contact = contactForm.value;
      contact.status = "RECEIVED";
      this.contatoService.saveContact(contactForm.value).subscribe((result) => {
        this.messageService.add({key: "contact-message", life: 2000, severity: 'success', summary: this.localizationService.translate('area.save_message_success.title'), detail: this.localizationService.translate('area.save_message_success.msg') })
        console.log(result);
      }, (error)=>{ 
        this.messageService.add({key: "contact-message", life: 2000, severity: 'error', summary: this.localizationService.translate('area.save_message_success.title'), detail: this.localizationService.translate('area.save_message_success.msg') })
        console.log(error);
      });
    }
  }
}
