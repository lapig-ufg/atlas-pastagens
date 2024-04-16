import { TestBed } from '@angular/core/testing';

import { LocalizationServiceConfig } from './localization-config.service';

describe('LocalizationConfigService', () => {
  let service: LocalizationServiceConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalizationServiceConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
