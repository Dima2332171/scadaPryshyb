import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogComfirmDelete } from './dialog-confirm-delete';

describe('DialogComfirmDelete', () => {
  let component: DialogComfirmDelete;
  let fixture: ComponentFixture<DialogComfirmDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComfirmDelete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogComfirmDelete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
