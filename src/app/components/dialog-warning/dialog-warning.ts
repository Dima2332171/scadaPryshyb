import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-dialog-warning',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatButton,
    MatDialogClose,
    MatDialogTitle
  ],
  templateUrl: './dialog-warning.html',
  styleUrl: './dialog-warning.css',
})
export class DialogWarning {
  constructor(
    public dialogRef: MatDialogRef<DialogWarning>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}
}
