import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ktp } from './ktp';

describe('Ktp', () => {
  let component: Ktp;
  let fixture: ComponentFixture<Ktp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ktp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ktp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
