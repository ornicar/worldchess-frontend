import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountRestoreComponent } from './account-restore.component';

describe('AccountRestoreComponent', () => {
  let component: AccountRestoreComponent;
  let fixture: ComponentFixture<AccountRestoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountRestoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountRestoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
