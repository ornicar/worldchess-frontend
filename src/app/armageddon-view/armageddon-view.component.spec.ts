import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmageddonViewComponent } from './armageddon-view.component';

describe('NewsViewComponent', () => {
  let component: ArmageddonViewComponent;
  let fixture: ComponentFixture<ArmageddonViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArmageddonViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArmageddonViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
