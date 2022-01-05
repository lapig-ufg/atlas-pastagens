import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor() { }

  public eventEmitter(
    eventAction: string,
    eventCategory: string,
    eventLabel: string,
    eventValue?: number,
  ) {
    gtag('event', eventAction, {
      'event_category': eventCategory,
      'event_label': eventLabel,
      'value': eventValue ? eventValue : 1
    })
  }
}
