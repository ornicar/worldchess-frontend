import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaygateSubsComponent } from './paygate-subs.component';

describe('PaygateSubsComponent', () => {
  let component: PaygateSubsComponent;
  let fixture: ComponentFixture<PaygateSubsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaygateSubsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaygateSubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
