import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {convertUtcToKyiv} from '../../core/services/date-time.utils';
import {ControlStation} from '../../core/services/control-station';
import {FormsModule} from '@angular/forms';

type UndoAction =
  | { type: 'delete'; index: number; item: any }
  | { type: 'edit'; index: number; field: string; oldValue: any };

@Component({
  selector: 'app-dialog-edit-journal',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule
  ],
  templateUrl: './dialog-edit-journal.html',
  styleUrl: './dialog-edit-journal.css',
})
export class DialogEditJournal implements OnInit {
  isSending = false;
  localData: any[] = [];
  undoStack: UndoAction[] = [];
  lastFocusedValue: any = null;

  constructor(
    public dialogRef: MatDialogRef<DialogEditJournal>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private controlService: ControlStation
  ) {}

  ngOnInit() {
    this.localData = structuredClone(this.data.data);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'z' || event.key.toLowerCase() === 'я')) {
      event.preventDefault();
      this.undo();
    }
  }

  deleteJournalInterval(index: number){
    this.undoStack.push({
      type: 'delete',
      index,
      item: structuredClone(this.localData[index])
    })
    this.localData.splice(index, 1);
  }

  undo() {
    const action = this.undoStack.pop();
    if (!action) return;

    if (action.type === 'delete') {
      this.localData.splice(action.index, 0, action.item);
    }

    if (action.type === 'edit') {
      this.localData[action.index][action.field] = action.oldValue;
    }
  }

  onConfirm() {
    const payload = {
      date: this.data.date,
      data: this.localData // Відправляємо те, що залишилось після видалень
    };
    console.log(payload)
  }

  onCancel() {
    this.dialogRef.close(false);
  }


  toggleBoolean(row: any, field: 'priorityGrid' | 'priorityPv' | 'priorityBess', index: number) {
    this.undoStack.push({
      type: 'edit',
      index,
      field,
      oldValue: row[field]
    });

    row[field] = !row[field];
  }

  onFocus(row: any, field: string){
    this.lastFocusedValue = row[field];
  }

  onNumberChange(row: any, field: string, index: number) {
    if (this.lastFocusedValue !== row[field]) {
      this.undoStack.push({
        type: 'edit',
        index,
        field,
        oldValue: this.lastFocusedValue
      });
    }
  }




  isIntervalActive(item: any) {return item.isActive}
  isIntervalModifyActive(item: any) {return item.modify && item.isActive}
  isIntervalModify(item: any) {return item.modify}
  protected readonly convertUtcToKyiv = convertUtcToKyiv;
  protected readonly onfocus = onfocus;
}
