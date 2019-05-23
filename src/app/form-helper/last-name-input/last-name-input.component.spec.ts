import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LastNameInputComponent } from './last-name-input.component';

describe('LastNameInputComponent', () => {
  let component: LastNameInputComponent;
  let fixture: ComponentFixture<LastNameInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LastNameInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastNameInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
