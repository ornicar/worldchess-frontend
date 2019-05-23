import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnershipComponent } from './partnership.component';

describe('PartnershipComponent', () => {
  let component: PartnershipComponent;
  let fixture: ComponentFixture<PartnershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
