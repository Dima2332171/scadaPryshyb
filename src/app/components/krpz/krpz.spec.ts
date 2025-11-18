import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Krpz } from './krpz';

describe('Krpz', () => {
  let component: Krpz;
  let fixture: ComponentFixture<Krpz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Krpz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Krpz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
