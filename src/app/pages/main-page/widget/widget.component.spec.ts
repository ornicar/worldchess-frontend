import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPageWidgetComponent } from './widget.component';

describe('RatingComponent', () => {
  let component: MainPageWidgetComponent;
  let fixture: ComponentFixture<MainPageWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainPageWidgetComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPageWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
