import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingPlayerPageComponent } from './rating-player-page.component';

describe('RatingPlayerPageComponent', () => {
  let component: RatingPlayerPageComponent;
  let fixture: ComponentFixture<RatingPlayerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatingPlayerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingPlayerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
