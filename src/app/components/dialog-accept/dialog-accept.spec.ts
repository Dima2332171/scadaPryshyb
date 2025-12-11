import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAccept } from './dialog-accept';

describe('DialogAccept', () => {
  let component: DialogAccept;
  let fixture: ComponentFixture<DialogAccept>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAccept]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAccept);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
