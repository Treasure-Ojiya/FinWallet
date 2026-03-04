import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinVerification } from './pin-verification';

describe('PinVerification', () => {
  let component: PinVerification;
  let fixture: ComponentFixture<PinVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinVerification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinVerification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
