import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ControlStation} from '../../core/services/control-station';
import {convertUtcToKyiv} from '../../core/services/date-time.utils';
import {WindowVisibility} from '../../core/services/window-visibility';
import {debounceTime, finalize, Subject, Subscription, takeUntil} from 'rxjs';
import {DialogConfirmDelete} from '../dialog-confirm-delete/dialog-confirm-delete';
import {MatDialog} from '@angular/material/dialog';


@Component({
  selector: 'app-mvc-control',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './mvc-control.html',
  styleUrl: './mvc-control.css',
})
export class MvcControl implements OnInit, OnDestroy {
  @Output() viewChange = new EventEmitter<any>();
  settingsForm!: FormGroup;
  daysJournal: any = [];

  isLoading: boolean = false;
  currentDetectedMode: string | null = null;
  private isApplyingPreset = false;
  private focusSubscription!: Subscription;
  private destroy$ = new Subject<void>();

  workModes = [
    {value: 'default', label: 'Оберіть режим'},
    {value: 'undefined', label: 'Невизначено'},
    {value: 'charge_from_grid', label: 'Заряд з мережі'},
    {value: 'charge_from_pv', label: 'Заряд з PV'},
    {value: 'charge_from_pv_excess', label: 'Заряд з PV, надлишок в мережу'},
    {value: 'discharge_to_grid', label: 'Розряд в мережу'},
    {value: 'pv_priority', label: 'PV генерація'},
    {value: 'pv_priority_excess', label: 'PV генерація, надлишок в батареї'},
    {value: 'maximum_charge', label: 'Максимальний заряд'},
    {value: 'maximum_discharge', label: 'Максимальний розряд'},
  ];

  constructor(
    private fb: FormBuilder,
    private controlStationService: ControlStation,
    private visibilityService: WindowVisibility,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.generateInitialDays();
    this.createForm();
    this.loadData();

    this.focusSubscription = this.visibilityService.windowFocus$.subscribe(() => {
      console.log('Focus Subscription');
      this.loadData();
    });

    // 1. Зміна pvMode — застосовуємо логіку і відразу перевіряємо режим
    this.settingsForm.get('pvMode')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((pvModeValue: string) => {
        // Твоя існуюча логіка
        if (pvModeValue === 'GRID') {
          this.settingsForm.patchValue({
            chargeFromGrid: 0,
            dischargeToGrid: 4950,
            pv: 6000,
            bess1ChargeSource: ['OFF'],
            bess1Charge: 0,
            bess1Discharge: 0,
            bess2ChargeSource: ['OFF'],
            bess2Charge: 0,
            bess2Discharge: 0,
          });
        } else if (pvModeValue === 'BESS') {
          this.settingsForm.patchValue({
            chargeFromGrid: 0,
            dischargeToGrid: 0,
            pv: 6000,
            bess1ChargeSource: ['PV'],
            bess1Charge: -2400,
            bess1Discharge: 0,
            bess2ChargeSource: ['PV'],
            bess2Charge: -2400,
            bess2Discharge: 0,
          });
        } else if (pvModeValue === 'GRID_THEN_BESS') {
          this.settingsForm.patchValue({
            chargeFromGrid: 0,
            dischargeToGrid: 4950,
            pv: 6000,
            bess1ChargeSource: ['PV'],
            bess1Charge: -2400,
            bess1Discharge: 0,
            bess2ChargeSource: ['PV'],
            bess2Charge: -2400,
            bess2Discharge: 0,
          });
        } else if (pvModeValue === 'BESS_THEN_GRID') {
          this.settingsForm.patchValue({
            chargeFromGrid: 0,
            dischargeToGrid: 4950,
            pv: 6000,
            bess1ChargeSource: ['PV'],
            bess1Charge: -2400,
            bess1Discharge: 0,
            bess2ChargeSource: ['PV'],
            bess2Charge: -2400,
            bess2Discharge: 0,
          });
        } else if (pvModeValue === 'OFF') {
          this.settingsForm.patchValue({pv: 0})
        }
      });

    this.settingsForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isApplyingPreset) return;
        this.detectCurrentMode();
      });

    // 3. Зміна workMode — ручний вибір пресету
    this.settingsForm.get('workMode')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        if (!mode || mode === 'default' || mode === 'undefined') return;

        this.applyPresetForMode(mode);
      });


    this.controlSynchronizeBessChargeSource();
  }

  ngOnDestroy(): void {
    this.focusSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm() {
    this.settingsForm = this.fb.group({
      workMode: 'default',

      chargeFromGrid: [{value: 0}, [Validators.min(0)]],
      dischargeToGrid: [{value: 0}, [Validators.min(0)]],

      pvMode: 'GRID_THEN_BESS',
      pv: [{value: 0}, [Validators.min(0)]],


      // BESS1
      bess1ChargeSource: 'GRID',
      bess1Charge: [{value: 0}],
      bess1Discharge: [{value: 0}, [Validators.min(0)]],
      // BESS2
      bess2ChargeSource: 'GRID',
      bess2Charge: [{value: 0}],
      bess2Discharge: [{value: 0}, [Validators.min(0)]],
    })
  }


  loadData() {
    this.isLoading = true;

    this.controlStationService.getJournalToday()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: data => {
          this.mergeJournalData(data);
        },
        error: err => {
          console.error(err);
        }
      });
  }


  private generateInitialDays() {
    this.daysJournal = [];

    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      this.daysJournal.push({
        date: date.toISOString().split('T')[0],
        data: [],
        receivedAt: '',
        updatedAt: '',
      })
    }
  }

  private mergeJournalData(realData: any[]): void {
    realData.forEach(realDay => {
      const index = this.daysJournal.findIndex((d: any) => d.date === realDay.date);
      if (index !== -1) {
        this.daysJournal[index].data = realDay.data;
        this.daysJournal[index].updatedAt = realDay.updatedAt;
        this.daysJournal[index].receivedAt = realDay.receivedAt;

      }
    });
    this.updateValuesForm()
  }

  openView(view: string, id?: any) {
    this.viewChange.emit({view, id});
  }

  private detectCurrentMode() {

    const v = this.settingsForm.getRawValue();
    let detected: string = 'undefined'; // За замовчуванням — ручний режим

    console.log(v)

    // 2. Сценарій: Заряд з мережі
    if (
      v.chargeFromGrid < 0 &&
      v.dischargeToGrid === 0 &&
      v.pvMode === 'OFF' &&
      v.pv === 0 &&
      (v.bess1Charge < 0 || v.bess2Charge < 0) &&
      v.bess1Discharge == 0 &&
      v.bess2Discharge == 0
    ) {
      detected = 'charge_from_grid';
    }

    // 3. Сценарій: Розряд в мережу
    else if (
      v.chargeFromGrid === 0 &&
      v.dischargeToGrid > 0 &&
      v.pv === 0 &&
      v.pvMode == "OFF" &&
      (v.bess1Discharge > 0 || v.bess2Discharge > 0) &&
      v.bess1Charge == 0 &&
      v.bess2Charge == 0 &&
      v.bess1ChargeSource === 'OFF' &&
      v.bess2ChargeSource === 'OFF'
    ) {
      detected = 'discharge_to_grid';
    }

    // 4. Сценарій: Заряд з PV
    else if (
      v.chargeFromGrid === 0 &&
      v.pv > 0 &&
      v.bess1Charge < 0 &&
      v.bess2Charge < 0 &&
      v.pvMode == "BESS" && v.dischargeToGrid == 0

    ) {
      detected = 'charge_from_pv';
    } else if (
      v.chargeFromGrid === 0 &&
      v.pv > 0 &&
      v.bess1Charge < 0 &&
      v.bess2Charge < 0 &&
      v.pvMode == "BESS_THEN_GRID" && v.dischargeToGrid >= 0
    ) {
      detected = 'charge_from_pv_excess';
    } else if (
      v.chargeFromGrid === 0 &&
      v.dischargeToGrid > 0 &&
      v.pv > 0 &&
      v.bess1Charge == 0 &&
      v.bess2Charge == 0 &&
      v.bess1Discharge == 0 &&
      v.bess2Discharge == 0 &&
      v.pvMode == "GRID"
    ) {
      detected = 'pv_priority';
    } else if (
      v.chargeFromGrid === 0 &&
      v.dischargeToGrid > 0 &&
      v.pvMode === 'GRID_THEN_BESS' &&
      v.bess1ChargeSource == 'PV' &&
      v.bess1Charge < 0 &&
      v.bess1Discharge == 0
    ) {
      detected = 'pv_priority_excess';
    } else if (
      v.chargeFromGrid < 0 &&
      v.dischargeToGrid == 0 &&
      v.pvMode == 'BESS' &&
      v.pv >= 1 &&
      v.bess1ChargeSource === 'PV_GRID' &&
      v.bess2ChargeSource === 'PV_GRID' &&
      v.bess1Charge < 0 &&
      v.bess2Charge < 0 &&
      v.bess2Discharge == 0 &&
      v.bess1Discharge == 0
    ) {
      detected = 'maximum_charge'
    } else if (
      v.chargeFromGrid === 0 &&
      v.dischargeToGrid > 0 &&
      v.pv > 0 &&
      v.pvMode == 'GRID_THEN_BESS' &&
      v.bess1ChargeSource === 'PV' &&
      v.bess2ChargeSource === 'PV' &&
      v.bess1Charge < 0 &&
      v.bess2Charge < 0 &&
      v.bess1Discharge > 0 &&
      v.bess2Discharge > 0
    ) {
      detected = 'maximum_discharge'
    }

    this.currentDetectedMode = detected;
  }


  private applyPresetForMode(mode: string) {
    if (mode === 'default' || mode === 'undefined') {
      return; // Нічого не робимо, залишаємо цифри як є
    }
    this.isApplyingPreset = true;
    this.settingsForm.patchValue({
      chargeFromGrid: 0,
      dischargeToGrid: 0,
      pv: 0,
      bess1Charge: 0,
      bess1Discharge: 0,
      bess2Charge: 0,
      bess2Discharge: 0,
    }, {emitEvent: false});

    switch (mode) {

      case 'main':
        this.settingsForm.patchValue({
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          pv: 6000,
          bess1Charge: -2400,
          bess1Discharge: 2400,
          bess2Charge: -2400,
          bess2Discharge: 2400,
        }, {emitEvent: false});
        break;


      case 'charge_from_grid':
        this.settingsForm.patchValue({
          chargeFromGrid: -4950,
          dischargeToGrid: 0,
          pv: 0,
          pvMode: "OFF",
          bess1ChargeSource: 'GRID',
          bess1Charge: -2400,
          bess1Discharge: 0,
          bess2ChargeSource: 'GRID',
          bess2Charge: -2400,
          bess2Discharge: 0,
        }, {emitEvent: false});
        break;

      case 'discharge_to_grid':
        this.settingsForm.patchValue({
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          pvMode: "OFF",
          pv: 0,
          bess1ChargeSource: 'OFF',
          bess1Charge: 0,
          bess1Discharge: 2400,
          bess2ChargeSource: 'OFF',
          bess2Charge: 0,
          bess2Discharge: 2400,
        }, {emitEvent: false});
        break;

      case 'pv_priority':
        this.settingsForm.patchValue({
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          pv: 6000,
          pvMode: "GRID",
          bess1ChargeSource: 'OFF',
          bess1Charge: 0,
          bess1Discharge: 0,
          bess2ChargeSource: 'OFF',
          bess2Charge: 0,
          bess2Discharge: 0,
        }, {emitEvent: false});
        break;

      case 'pv_priority_excess':
        this.settingsForm.patchValue({
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          pv: 6000,
          pvMode: "GRID_THEN_BESS",
          bess1ChargeSource: 'PV',
          bess1Charge: -2400,
          bess1Discharge: 0,
          bess2ChargeSource: 'PV',
          bess2Charge: -2400,
          bess2Discharge: 0,
        }, {emitEvent: false});
        break;


      case 'charge_from_pv':
        this.settingsForm.patchValue({
          chargeFromGrid: 0,
          dischargeToGrid: 0,
          pvMode: "BESS",
          pv: 6000,
          bess1ChargeSource: 'PV',
          bess1Charge: -2400,
          bess2ChargeSource: 'PV',
          bess1Discharge: 0,
          bess2Charge: -2400,
          bess2Discharge: 0,
        }, {emitEvent: false});
        break;

      case 'charge_from_pv_excess':
        this.settingsForm.patchValue({
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          pvMode: "BESS_THEN_GRID",
          pv: 6000,
          bess1ChargeSource: 'PV',
          bess1Charge: -2400,
          bess2ChargeSource: 'PV',
          bess1Discharge: 0,
          bess2Charge: -2400,
          bess2Discharge: 0,
        }, {emitEvent: false});
        break;

      case 'maximum_charge':
        this.settingsForm.patchValue({
          chargeFromGrid: -4950,
          dischargeToGrid: 0,
          pvMode: "BESS",
          pv: 6000,
          bess1ChargeSource: 'PV_GRID',
          bess1Charge: -2400,
          bess1Discharge: 0,
          bess2ChargeSource: 'PV_GRID',
          bess2Charge: -2400,
          bess2Discharge: 0,
        }, {emitEvent: false})
        break;

      case 'maximum_discharge':
        this.settingsForm.patchValue({
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          pvMode: 'GRID_THEN_BESS',
          pv: 6000,
          bess1ChargeSource: 'PV',
          bess1Charge: -2400,
          bess1Discharge: 2400,
          bess2ChargeSource: 'PV',
          bess2Charge: -2400,
          bess2Discharge: 2400,
        }, {emitEvent: false})
        break;


      default:
        break;
    }

    this.currentDetectedMode = mode;

    // 🔹 микротаск — чтобы Angular успел обновить форму
    setTimeout(() => {
      this.isApplyingPreset = false;
    });
  }


  // Отправка формы
  onSubmit(): void {
    const formValue = this.settingsForm.getRawValue();

    const startTime = this.getStartTimeForActiveRange();
    const endTime = this.getEndTimeForActiveRange();

    if (!startTime || !endTime) {
      alert('Помилка: не вдалося визначити поточний активний діапазон.');
      return;
    }
    const selectedMode = this.workModes.find(mode => mode.value === formValue.workMode);

    // Формируем один объект Interval
    const interval: any = {
      startTime: startTime,
      endTime: endTime,
      scenario: selectedMode ? selectedMode.label : 'Невизначено',
      chargeFromGrid: formValue.chargeFromGrid ?? 0,
      dischargeToGrid: formValue.dischargeToGrid ?? 0,
      pvMode: formValue.pvMode ?? null,
      pv: formValue.pv ?? 0,
      bess1ChargeSource: formValue.bess1ChargeSource ?? null,
      bess1Charge: formValue.bess1Charge,
      bess1Discharge: formValue.bess1Discharge,
      bess2ChargeSource: formValue.bess2ChargeSource ?? null,
      bess2Charge: formValue.bess2Charge,
      bess2Discharge: formValue.bess2Discharge,
    };


    // delete interval.workMode;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // "2025-12-16"

    const payload = {
      date: dateStr,
      data: [interval],
      request_timestamp: new Date().toISOString()
    };

    console.log('Відправляємо на сервер:', payload);

    this.controlStationService.saveOverrideDay(payload)
      .subscribe({
        next: (response: any) => {
          console.log(`Журнал за ${payload.date} успішно відкориговано.`);
          this.mergeJournalData([{
            date: payload.date,
            data: response.currentData,
            updatedAt: response.updatedAt,
            receivedAt: response.receivedAt
          }]);
        },
        error: (err) => {
          console.error('Помилка коригування журналу:', err);
        },
      });
  }

  controlSynchronizeBessChargeSource() {
    const b1Source = this.settingsForm.get('bess1ChargeSource');
    const b2Source = this.settingsForm.get('bess2ChargeSource');

    b1Source?.valueChanges.subscribe(value => {
      if (value == 'OFF') {
        this.settingsForm.get('bess1Charge')?.patchValue(0)
      } else if (value !== 'OFF') {
        b2Source?.patchValue(value, {emitEvent: false});
      }
    })

    b2Source?.valueChanges.subscribe(value => {
      if (value == 'OFF') {
        this.settingsForm.get('bess2Charge')?.patchValue(0)
      } else if (value !== 'OFF') {
        b1Source?.patchValue(value, {emitEvent: false});
      }
    })
  }

  getStartTimeForActiveRange() {
    return new Date().toISOString().split('.')[0] + 'Z'
  }

  getEndTimeForActiveRange() {
    for (const day of this.daysJournal) {
      const activeInterval = day.data.find((interval: any) => interval.isActive === true);

      if (activeInterval) {
        return activeInterval.endTime;
      }
    }
    return null;
  }

  resetForm(): void {
    this.settingsForm.reset({
      chargeFromGrid: 0,
      dischargeToGrid: 0,
      pv: 0,
      bess1Charge: 0,
      bess1Discharge: 0,
      bess2Charge: 0,
      bess2Discharge: 0,
    });
  }

  getLocalTime(time: any) {
    const full = convertUtcToKyiv(time, 'full');
    return full.split(' ')[1].substring(0, 5); // "HH:mm"
  }



  updateValuesForm() {
    console.log(this.daysJournal)

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(today.getDate()).padStart(2, '0');

    const todayDateString = `${year}-${month}-${dayOfMonth}`;

    console.log('Сьогоднішня дата для пошуку:', todayDateString);
    this.daysJournal.forEach((day: any) => {
      if (day.date === todayDateString) {
        day.data.forEach((day: any) => {
          if (day.isActive) {
            this.settingsForm.patchValue({
              chargeFromGrid: day.chargeFromGrid,
              dischargeToGrid: day.dischargeToGrid,
              pvMode: day.pvMode,
              pv: day.pv,
              bess1ChargeSource: day.bess1ChargeSource,
              bess1Charge: day.bess1Charge,
              bess1Discharge: day.bess1Discharge,
              bess2ChargeSource: day.bess2ChargeSource,
              bess2Charge: day.bess2Charge,
              bess2Discharge: day.bess2Discharge,
            });
          }
        })
      }
    })

  }

  isIntervalActive(item: any) {
    return item.isActive
  }

  isIntervalModifyActive(item: any) {
    return item.modify && item.isActive
  }

  onDeleteModifyRange(date: string) {
    console.log(date)

    const dialogRef = this.dialog.open(DialogConfirmDelete, {
      data: {
        title: 'Підтвердження видалення ручної уставки',
        message: `Ви впевнені, що хоче видалити поточну уставку, яка була встановлена вручну? Ця дія незворотна.`
      },
      width: 'auto',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.controlStationService.deleteOverrideDay(date).subscribe({
          next: () => {
            console.log(`Журнал за ${date} успішно видалено.`);
            this.loadData();
          },
          error: (err) => {
            console.error('Помилка видалення журналу:', err);
            alert(`Неможливо видалити журнал: ${err.message || 'Помилка мережі/сервера'}`);
          },
        });
      }
    })
  }

  getBessChargeSource(item: any) {
    if (item == 'PV') {
      return 'Заряд з PV'
    } else if (item == 'PV_GRID') {
      return 'Заряд з PV-мережа'
    } else if (item == 'GRID') {
      return 'Заряд з мережі'
    } else {
      return '--'
    }
  }

  getPvMode(item: any) {
    if (item == 'BESS') {
      return 'В батареї'
    } else if (item == 'GRID') {
      return 'В мережу'
    } else if (item == 'GRID_THEN_BESS') {
      return 'В мережу → надлишок у батареї '
    } else if (item == 'BESS_THEN_GRID') {
      return 'В батареї → надлишок у мережу '
    } else if (item == 'OFF') {
      return 'Викл'
    } else {
      return '--'
    }
  }

  protected readonly convertUtcToKyiv = convertUtcToKyiv;
}
