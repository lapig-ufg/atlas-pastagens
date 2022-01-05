import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { environment } from "../environments/environment";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit{
  title = 'Base Application';
  constructor(private primengConfig: PrimeNGConfig) {
    const head = document.getElementsByTagName('head')[0];
    let googleTagURL = document.createElement('script');
    let gtag = document.createElement('script');

    googleTagURL.async = true;
    googleTagURL.src = `https://www.googletagmanager.com/gtag/js?id=${environment.GTAG}`
    gtag.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${environment.GTAG}');
    `;
    head.insertBefore(googleTagURL, head.lastChild);
    head.insertBefore(gtag, head.lastChild);
  }

  ngOnInit() {
    this.primengConfig.ripple = true;
  }
}
