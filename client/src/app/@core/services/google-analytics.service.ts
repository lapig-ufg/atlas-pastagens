import { Injectable } from '@angular/core';

export { GoogleAnalyticsService };

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
class GoogleAnalyticsService {

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
