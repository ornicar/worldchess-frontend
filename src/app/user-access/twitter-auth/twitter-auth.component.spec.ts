import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitterAuthComponent } from './twitter-auth.component';

describe('TwitterAuthComponent', () => {
  let component: TwitterAuthComponent;
  let fixture: ComponentFixture<TwitterAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitterAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitterAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
