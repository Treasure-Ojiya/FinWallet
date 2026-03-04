import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinSetup } from './pin-setup';

describe('PinSetup', () => {
  let component: PinSetup;
  let fixture: ComponentFixture<PinSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinSetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
