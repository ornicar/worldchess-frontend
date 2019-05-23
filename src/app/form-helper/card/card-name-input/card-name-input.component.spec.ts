import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardNameInputComponent } from './card-name-input.component';

describe('CardNameInputComponent', () => {
  let component: CardNameInputComponent;
  let fixture: ComponentFixture<CardNameInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardNameInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardNameInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
