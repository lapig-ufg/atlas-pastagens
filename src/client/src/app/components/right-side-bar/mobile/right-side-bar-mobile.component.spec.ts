import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightSideBarMobileComponent } from './right-side-bar-mobile.component';

describe('MobileComponent', () => {
  let component: RightSideBarMobileComponent;
  let fixture: ComponentFixture<RightSideBarMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RightSideBarMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RightSideBarMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
