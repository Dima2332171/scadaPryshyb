import {Component, Inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm-delete',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle
  ],
  standalone: true,
  templateUrl: './dialog-confirm-delete.html',
  styleUrl: './dialog-confirm-delete.css',
})
export class DialogConfirmDelete {

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmDelete>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
