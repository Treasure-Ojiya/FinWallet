import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinChange } from './pin-change';

describe('PinChange', () => {
  let component: PinChange;
  let fixture: ComponentFixture<PinChange>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinChange]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinChange);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
