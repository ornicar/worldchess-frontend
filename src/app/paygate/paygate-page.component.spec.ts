import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaygatePageComponent } from './paygate-page.component';

describe('PaygatePageComponent', () => {
  let component: PaygatePageComponent;
  let fixture: ComponentFixture<PaygatePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaygatePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaygatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
