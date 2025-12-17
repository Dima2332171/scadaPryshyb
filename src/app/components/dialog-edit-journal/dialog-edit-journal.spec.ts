import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditJournal } from './dialog-edit-journal';

describe('DialogEditJournal', () => {
  let component: DialogEditJournal;
  let fixture: ComponentFixture<DialogEditJournal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditJournal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditJournal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
