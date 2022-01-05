import { TestBed } from '@angular/core/testing';

import { LocalizationConfigService } from './localization-config.service';

describe('LocalizationConfigService', () => {
  let service: LocalizationConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalizationConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
