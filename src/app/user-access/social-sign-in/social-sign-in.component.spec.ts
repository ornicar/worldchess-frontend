import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialSignInComponent } from './social-sign-in.component';

describe('SocialSignInComponent', () => {
  let component: SocialSignInComponent;
  let fixture: ComponentFixture<SocialSignInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialSignInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
