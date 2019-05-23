import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPromoInputComponent } from './card-promo-input.component';

describe('CardPromoInputComponent', () => {
  let component: CardPromoInputComponent;
  let fixture: ComponentFixture<CardPromoInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardPromoInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPromoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
