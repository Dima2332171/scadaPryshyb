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
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log(this.data)
  }

  onConfirm() {
    if (this.isSending) return;

    this.isSending = true;

    const payload = this.data.parsedData; // уже в нужном формате!

    this.http
      .post('http://localhost:8000/api/save-journal-day', payload)
      .subscribe({
        next: (res: any) => {
          console.log('Уставки успішно збережено!', res);
          this.dialogRef.close(true); // закрываем с успехом
        },
        error: (err) => {
          console.error('Помилка збереження:', err);
          alert('Не вдалося зберегти уставки. Перевірте бекенд.');
          this.isSending = false;
        },
      });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  protected readonly convertUtcToKyiv = convertUtcToKyiv;
}
