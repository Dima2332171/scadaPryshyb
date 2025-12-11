import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWarning } from './dialog-warning';

describe('DialogWarning', () => {
  let component: DialogWarning;
  let fixture: ComponentFixture<DialogWarning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogWarning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogWarning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
