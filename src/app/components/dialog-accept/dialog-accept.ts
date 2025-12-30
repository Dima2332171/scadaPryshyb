import {Component, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {convertUtcToKyiv} from '../../core/services/date-time.utils';
import {HttpClient} from '@angular/common/http';
import {ControlStation} from '../../core/services/control-station';

@Component({
  selector: 'app-dialog-accept',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
  ],
  templateUrl: './dialog-accept.html',
  styleUrl: './dialog-accept.css',
})
export class DialogAccept implements OnInit {
  isSending = false;
  constructor(
    public dialogRef: MatDialogRef<DialogAccept>,
    @Inject(MAT_DIALOG_DATA) public data: { parsedData: any },
    private controlService: ControlStation
  ) {}

  ngOnInit() {
    console.log(this.data)
  }

  onConfirm() {
    if (this.isSending) return;

    this.isSending = true;

    const payload = this.data.parsedData; // уже в нужном формате!
    console.log(payload);

    this.controlService.saveJournalDay(payload).subscribe({
      next: (res: any) => {
        console.log('Уставки успішно збережено!', res);
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Помилка збереження:', err);
        alert('Не вдалося зберегти уставки. Перевірте бекенд або мережу.');
        this.isSending = false;
        this.dialogRef.close(false);
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  protected readonly convertUtcToKyiv = convertUtcToKyiv;
}
