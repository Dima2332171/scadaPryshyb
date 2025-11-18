import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mvc } from './mvc';

describe('Mvc', () => {
  let component: Mvc;
  let fixture: ComponentFixture<Mvc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mvc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mvc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
