import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MvcEditDay } from './mvc-edit-day';

describe('MvcEditDay', () => {
  let component: MvcEditDay;
  let fixture: ComponentFixture<MvcEditDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MvcEditDay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MvcEditDay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
