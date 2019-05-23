import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnershipPageComponent } from './partnership-page.component';

describe('PartnershipPageComponent', () => {
  let component: PartnershipPageComponent;
  let fixture: ComponentFixture<PartnershipPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnershipPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnershipPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
