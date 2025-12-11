import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MvcControl } from './mvc-control';

describe('MvcControl', () => {
  let component: MvcControl;
  let fixture: ComponentFixture<MvcControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MvcControl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MvcControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
