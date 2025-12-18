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
  private undoStack: { index: number, item: any }[] = [];

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
    const removedItem = this.localData[index];
    this.undoStack.push({ index, item: removedItem });
    this.localData.splice(index, 1);
  }

  undo(){
    const lastAction = this.undoStack.pop();
    if (lastAction) {
      this.localData.splice(lastAction.index, 0, lastAction.item);
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




  isIntervalActive(item: any) {return item.isActive}
  isIntervalModifyActive(item: any) {return item.modify && item.isActive}
  isIntervalModify(item: any) {return item.modify}
    protected readonly convertUtcToKyiv = convertUtcToKyiv;
}
