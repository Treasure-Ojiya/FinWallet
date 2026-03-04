import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopUp } from './top-up';

describe('TopUp', () => {
  let component: TopUp;
  let fixture: ComponentFixture<TopUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
