import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingListPageComponent } from './rating-list-page.component';

describe('RatingListPageComponent', () => {
  let component: RatingListPageComponent;
  let fixture: ComponentFixture<RatingListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatingListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
