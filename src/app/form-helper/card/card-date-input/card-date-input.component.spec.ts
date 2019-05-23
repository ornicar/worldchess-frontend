import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDateInputComponent } from './card-date-input.component';

describe('CardDateInputComponent', () => {
  let component: CardDateInputComponent;
  let fixture: ComponentFixture<CardDateInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardDateInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardDateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
