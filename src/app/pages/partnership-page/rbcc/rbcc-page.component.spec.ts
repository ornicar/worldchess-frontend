import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RbccPageComponent } from './rbcc-page.component';

describe('RbccPageComponent', () => {
  let component: RbccPageComponent;
  let fixture: ComponentFixture<RbccPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RbccPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbccPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
