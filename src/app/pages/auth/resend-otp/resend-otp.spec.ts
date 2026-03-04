import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendOTP } from './resend-otp';

describe('ResendOTP', () => {
  let component: ResendOTP;
  let fixture: ComponentFixture<ResendOTP>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendOTP]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResendOTP);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
