import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxControlComponent } from './checkbox-control.component';

describe('PasswordInputComponent', () => {
  let component: CheckboxControlComponent;
  let fixture: ComponentFixture<CheckboxControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
