import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardNumberInputComponent } from './card-number-input.component';

describe('CardNumberInputComponent', () => {
  let component: CardNumberInputComponent;
  let fixture: ComponentFixture<CardNumberInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardNumberInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardNumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
