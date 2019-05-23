import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstNameInputComponent } from './first-name-input.component';

describe('FirstNameInputComponent', () => {
  let component: FirstNameInputComponent;
  let fixture: ComponentFixture<FirstNameInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstNameInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstNameInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
