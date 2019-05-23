import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCvcInputComponent } from './card-cvc-input.component';

describe('CardCvcInputComponent', () => {
  let component: CardCvcInputComponent;
  let fixture: ComponentFixture<CardCvcInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardCvcInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardCvcInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
