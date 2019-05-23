import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LondonTimerComponent } from './london-timer.component';

describe('LondonTimerComponent', () => {
  let component: LondonTimerComponent;
  let fixture: ComponentFixture<LondonTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LondonTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LondonTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
