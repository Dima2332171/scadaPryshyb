import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import {convertKyivToUtc, convertUtcToKyiv} from '../../core/services/date-time.utils';
import {DialogWarning} from '../dialog-warning/dialog-warning';
import {DialogAccept} from '../dialog-accept/dialog-accept';
import {ControlStation} from '../../core/services/control-station';


@Component({
  selector: 'app-mvc-edit-day',
  templateUrl: './mvc-edit-day.html',
  styleUrl: './mvc-edit-day.css',
})
export class MvcEditDay implements OnInit {
  @Output() viewChange = new EventEmitter<any>();
  @Input() public day: any;

  selectedFile: File | null = null;
  isDragOver = false;
  parsedData: any | null = null;
  setPointToday: any;
  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private controlStationService: ControlStation,
  ) {
  }


  ngOnInit() {
    console.log(this.day);
    this.controlStationService.getSetPointToday(this.day).subscribe((data: any) => {
      this.setPointToday = data
      console.log(data);
    })
  }

  openView(view: string, id?: number) {
    this.viewChange.emit({ view, id });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.parseExcel(file);
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.showAccept(this.parsedData);

    // this.http.post('http://your-server.com/api/upload-excel', formData)
    //   .subscribe({
    //     next: res => alert('Файл успішно завантажено!'),
    //     error: err => alert('Помилка завантаження файлу!')
    //   });
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel') {
        this.selectedFile = file;
      } else {
        alert('Будь ласка, завантажте Excel файл (.xlsx або .xls)');
      }
    }
  }

  downloadFile() {
    this.http.get(`http://localhost:8000/download/${this.day}`, {
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  removeFile() {
    this.selectedFile = null;
  }



  parseExcel(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Главное: raw: true — мы сами всё контролируем!
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: true,      // ← ВОТ ЭТО ВАЖНО!
        defval: null
      }) as any[][];

      //Додатки помилку, що файл пустий, або не вистачає значень. Бо якщо тільки 2 рядки, то це тільки заголовки
      if (rows.length < 3) return;

      // Заголовки
      const header = rows[0].map(h => (h ?? '').toString().trim().toLowerCase());
      const idx = {
        date: header.indexOf('дата'),
        start: header.indexOf('початок'),
        end: header.indexOf('кінець'),
        priorityGrid: header.indexOf('пріоритет мережа'),
        chargeFromGrid: header.indexOf('заряд з мережі'),
        dischargeToGrid: header.indexOf('видача в мережу'),
        priorityPv: header.indexOf('пріоритет pv'),
        pv: header.indexOf('pv'),
        imbalances: header.indexOf('небаланси'),
        priorityBess: header.indexOf('пріоритет bess'),
        bess1Charge: header.indexOf('заряд bess1'),
        bess1Discharge: header.indexOf('розряд bess1'),
        bess2Charge: header.indexOf('заряд bess2'),
        bess2Discharge: header.indexOf('розряд bess2'),
      };

      const pad = (n: number) => n.toString().padStart(2, '0');

      // Правильная конверсия Excel-даты (целое число → Date)
      const excelDateToJS = (excelDate: number): Date => {
        return new Date((excelDate - 25569) * 86400 * 1000);
      };

      const formatISODate = (date: Date): string => {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      };

      // Правильная конверсия времени (дробь 0.376 → часы:минуты)
      const excelTimeToStr = (excelTime: number): string => {
        if (excelTime == null) return '00:00';
        const totalMinutes = Math.round(excelTime * 24 * 60);
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        return `${pad(h)}:${pad(m)}`;
      };

      const grouped: Record<string, any> = {};

      for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 11) continue;

        const dateNum = row[idx.date];
        const startNum = row[idx.start];
        const endNum = row[idx.end];

        if (dateNum == null || startNum == null || endNum == null) continue;

        // Дата — целое число → нормальная дата
        const baseDate = excelDateToJS(dateNum);
        const dateKey = formatISODate(baseDate);

        const combineDateTime = (timeStr: string): string => {
          const [h, m] = timeStr.split(':').map(Number);
          const dt = new Date(baseDate);
          dt.setHours(h, m, 0, 0);
          return `${dateKey}T${timeStr}:00`;                 // ← самый короткий и надёжный вариант
          // или полностью:
          // return dt.toISOString().slice(0, 16) + ':00';   // 2025-12-05T14:30:00
        };
        // Время — дробные числа → строки
        let startTime = excelTimeToStr(startNum);
        let endTime = excelTimeToStr(endNum);
        let startTimeCombined = combineDateTime(startTime);
        let endTimeCombined = combineDateTime(endTime);


        // Ключевая проверка: переход через полночь
        const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

        if (endMinutes < startMinutes || endMinutes === 0 && startMinutes > 0) {
          // Это следующий день — но мы НЕ меняем dateKey!
          // Мы просто оставляем endTime как есть — оно и так правильно
          // А если потом будешь строить график на 48 часов — просто учтёшь это
        }

        if (!grouped[dateKey]) {
          grouped[dateKey] = { date: dateKey, data: [] };
        }

        grouped[dateKey].data.push({
          startTime: startTimeCombined ? convertKyivToUtc(startTimeCombined) : null,
          endTime: endTimeCombined ? convertKyivToUtc(endTimeCombined) : null,
          priorityGrid: row[idx.priorityGrid]?.toString().trim().toLowerCase() === 'так',
          chargeFromGrid: row[idx.chargeFromGrid] != null ? Number(row[idx.chargeFromGrid]) : null,
          dischargeToGrid: row[idx.dischargeToGrid] != null ? Number(row[idx.dischargeToGrid]) : null,
          priorityPv: row[idx.priorityPv]?.toString().trim().toLowerCase() === 'так',
          pv: row[idx.pv] != null ? Number(row[idx.pv]) : null,
          imbalances: row[idx.imbalances] != null ? row[idx.imbalances].toString().trim().toLowerCase() === 'так' : null,
          priorityBess: row[idx.priorityBess]?.toString().trim().toLowerCase() === 'так',
          bess1Charge: row[idx.bess1Charge] != null ? Number(row[idx.bess1Charge]) : null,
          bess1Discharge: row[idx.bess1Discharge] != null ? Number(row[idx.bess1Discharge]) : null,
          bess2Charge: row[idx.bess2Charge] != null ? Number(row[idx.bess2Charge]) : null,
          bess2Discharge: row[idx.bess2Discharge] != null ? Number(row[idx.bess2Discharge]) : null,
        });
      }

      // Сортировка по времени внутри дня
      Object.values(grouped).forEach((day: any) => {
        day.data.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
      });

      const resultObject = Object.values(grouped);
      this.parsedData = resultObject.length === 1 ? resultObject[0] : resultObject;
      console.log("Ексель дані:", this.parsedData);
      this.validateParsedData(this.parsedData!);


      // Если нужно — сохрани в переменную или вызови коллбэк
      // this.onParsed?.(result);
    };

    reader.readAsArrayBuffer(file);
  }

  validateParsedData(data: any) {
    console.log("Валідація", this.parsedData);

    if (!this.parsedData || !this.parsedData.data) {
      this.showWarning(`Ви завантажуєте щось не те. Очікується дані за: ${this.day}`);
      this.selectedFile = null;
      this.parsedData = null;
      return;
    }

    if (data.date !== this.day) {
      this.showWarning(`Ви завантажуєте дані за інший день: ${data.date}. Очікується: ${this.day}`);
      this.selectedFile = null;
      this.parsedData = null;
      return;
    }

    const requiredFields = [
      'startTime', 'endTime', 'chargeFromGrid', 'dischargeToGrid',
      'pv', 'imbalances', 'bess1Charge', 'bess1Discharge',
      'bess2Charge', 'bess2Discharge'
    ];

    const fieldRanges: Record<string, { min: number; max: number }> = {
      chargeFromGrid: { min: -4950, max: 0 },
      dischargeToGrid: { min: 0, max: 4950 },
      pv: { min: 0, max: 6000 },
      bess1Charge: { min: -2400, max: 0 },
      bess1Discharge: { min: 0, max: 2400 },
      bess2Charge: { min: -2400, max: 0 },
      bess2Discharge: { min: 0, max: 2400 },
    };

    for (let i = 0; i < data.data.length; i++) {
      const row = data.data[i];

      // Проверка наличия значения
      for (const field of requiredFields) {
        if (row[field] === null || row[field] === undefined || row[field] === '') {
          this.showWarning(
            `Ой! У рядку ${convertUtcToKyiv(row.startTime)} пропущено значення для поля "${field}". ` +
            `Будь ласка, заповніть усі поля і спробуйте завантажити файл ще раз 😊`
          );
          this.selectedFile = null;
          this.parsedData = null;
          return;
        }
      }

      // Проверка диапазонов
      for (const field of Object.keys(fieldRanges)) {
        const value = Number(row[field]);
        const { min, max } = fieldRanges[field];
        if (value < min || value > max) {
          this.showWarning(
            `В рядку ${convertUtcToKyiv(row.startTime)} значення "${field}" = ${value} виходить за допустимий діапазон (${min}…${max}). Будь ласка, виправте його.`
          );
          this.selectedFile = null;
          this.parsedData = null;
          return;
        }
      }
    }
  }


  showWarning(message: string) {
    this.dialog.open(DialogWarning, {
      data: { message }
    });
  }

  showAccept(parsedData: any) {
    const dialogRef = this.dialog.open(DialogAccept, {
      width: 'auto',
      maxWidth: '90vw',
      data: {
        parsedData: parsedData
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // 'result' буде 'true', якщо натиснуто 'Підтвердити' і збереження пройшло успішно.
      // 'result' буде 'false' або 'undefined', якщо натиснуто 'Відмінити' або діалог закрито іншим чином.

      if (result === true) {
        console.log('Успішне підтвердження. Оновлюємо дані...');

        // ВИКЛИКАЄМО ВАШ ЗАПИТ НА ОНОВЛЕННЯ
        this.refreshSetPointData();
      }
    });
  }

  getLocalTime(time: any) {
    const full = convertUtcToKyiv(time, 'full');
    return full.split(' ')[1].substring(0, 5); // "HH:mm"
  }

  refreshSetPointData() {

    this.controlStationService.getSetPointToday(this.day).subscribe((data: any) => {
      this.setPointToday = data
      console.log('Дані уставок оновлено:', data);
    });
  }

  protected readonly convertUtcToKyiv = convertUtcToKyiv;
}
