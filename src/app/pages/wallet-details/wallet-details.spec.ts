import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletDetails } from './wallet-details';

describe('WalletDetails', () => {
  let component: WalletDetails;
  let fixture: ComponentFixture<WalletDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
