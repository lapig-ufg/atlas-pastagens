import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetodosComponent } from './metodos.component';

describe('MetodosComponent', () => {
  let component: MetodosComponent;
  let fixture: ComponentFixture<MetodosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetodosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
