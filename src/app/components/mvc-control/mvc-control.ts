import {Component, EventEmitter, OnInit, Output, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ControlStation} from '../../core/services/control-station';
import {convertUtcToKyiv} from '../../core/services/date-time.utils';


@Component({
  selector: 'app-mvc-control',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './mvc-control.html',
  styleUrl: './mvc-control.css',
})
export class MvcControl implements OnInit {
  @Output() viewChange = new EventEmitter<any>();
  settingsForm!: FormGroup;
  daysJournal: any = [];

  workModes = [
    { value: 'default', label: 'Оберіть режим'},
    { value: 'main', label: 'Головний'},
    { value: 'charge_from_grid', label: 'Заряд з мережі' },
    { value: 'discharge_to_grid', label: 'Розряд в мережу' },
    { value: 'pv_priority', label: 'PV генерація' },
    { value: 'pv_limit_full_charge', label: 'PV limit full charge' },
    { value: 'max_pv_full_charge', label: 'Max Pv full charge' },
  ];
  currentActiveInterval: any = null;
  private isFormInitialized = false;
  constructor(
    private fb: FormBuilder,
    private controlStationService: ControlStation,
  )
  {}

  ngOnInit() {
    this.generateInitialDays()
    this.settingsForm = this.fb.group({
      workMode: ['default'],

      priorityGrid: [false],
      chargeFromGrid: [{ value: 0 }, [Validators.min(0)]],
      dischargeToGrid: [{ value: 0 }, [Validators.min(0)]],

      imbalances: [false],

      priorityPv: [false],
      pv: [{ value: 0 }, [Validators.min(0)]],

      priorityBess: [false],
      // BESS1
      bess1Charge: [{ value: 0}],
      bess1Discharge: [{ value: 0 }, [Validators.min(0)]],
      // BESS2
      bess2Charge: [{ value: 0}],
      bess2Discharge: [{ value: 0 }, [Validators.min(0)]],
    })

    this.settingsForm.get('workMode')!.valueChanges.subscribe(mode => {
      this.applyPresetForMode(mode);
    });
    this.controlStationService.getJournalToday().subscribe((data: any) => {
      console.log(data);
      this.mergeJournalData(data);
    })
  }

  private generateInitialDays() {
    this.daysJournal = [];

    for (let i = 0; i < 3; i++){
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


  // Отправка формы
  onSubmit(): void {
    if (this.settingsForm.valid) {
      console.log('Новые уставки:', this.settingsForm.getRawValue());
      // Здесь будет твой HTTP-запрос:
      // this.settingsService.applySettings(this.settingsForm.value).subscribe(...)

      this.settingsForm.markAsPristine();
      alert('Налаштування успішно застосовано!');
    }
  }

  resetForm(): void {
    this.settingsForm.reset({
      priorityGrid: false,
      chargeFromGrid: 0,
      dischargeToGrid: 0,
      imbalances: false,
      priorityPv: false,
      pv: 0,
      priorityBess: false,
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

  openView(view: string, id?: any) {
    this.viewChange.emit({ view, id });
  }


  private applyPresetForMode(mode: string) {
    this.settingsForm.patchValue({
      priorityGrid: false,
      chargeFromGrid: 0,
      dischargeToGrid: 0,
      imbalances: false,
      priorityPv: false,
      pv: 0,
      priorityBess: false,
      bess1Charge: 0,
      bess1Discharge: 0,
      bess2Charge: 0,
      bess2Discharge: 0,
    });

    if (mode === 'default') {
      return;
    }

    switch (mode) {

      case 'main':
        this.settingsForm.patchValue({
          priorityGrid: true,
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          imbalances: false,
          priorityPv: true,
          pv: 6000,
          priorityBess: true,
          bess1Charge: -2400,
          bess1Discharge: 2400,
          bess2Charge: -2400,
          bess2Discharge: 2400,
        });
        break;


      case 'charge_from_grid':
        this.settingsForm.patchValue({
          priorityGrid: false,
          chargeFromGrid: -4950,
          dischargeToGrid: 0,
          imbalances: false,
          priorityPv: false,
          pv: 0,
          priorityBess: false,
          bess1Charge: -2400,
          bess1Discharge: 0,
          bess2Charge: -2400,
          bess2Discharge: 0,
        });
        break;

      case 'discharge_to_grid':
        this.settingsForm.patchValue({
          priorityGrid: false,
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          imbalances: false,
          priorityPv: false,
          pv: 0,
          priorityBess: false,
          bess1Charge: 0,
          bess1Discharge: 2400,
          bess2Charge: 0,
          bess2Discharge: 2400,
        });
        break;

      case 'pv_priority':
        this.settingsForm.patchValue({
          priorityGrid: false,
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          imbalances: false,
          priorityPv: false,
          pv: 6000,
          priorityBess: false,
          bess1Charge: 0,
          bess1Discharge: 0,
          bess2Charge: 0,
          bess2Discharge: 0,
        });
        break;

      case 'pv_limit_full_charge':
        this.settingsForm.patchValue({
          priorityGrid: false,
          chargeFromGrid: 0,
          dischargeToGrid: 4950,
          imbalances: false,
          priorityPv: true,
          pv: 6000,
          priorityBess: true,
          bess1Charge: -2400,
          bess1Discharge: 0,
          bess2Charge: -2400,
          bess2Discharge: 0,
        });
        break;

      case 'max_pv_full_charge':
        this.settingsForm.patchValue({
          priorityGrid: false,
          chargeFromGrid: -4950,
          dischargeToGrid: 0,
          imbalances: false,
          priorityPv: true,
          pv: 6000,
          priorityBess: true,
          bess1Charge: -2400,
          bess1Discharge: 0,
          bess2Charge: -2400,
          bess2Discharge: 0,
        });
        break;

      default:
        break;
    }
  }

  updateValuesForm(){
    console.log(this.daysJournal)

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(today.getDate()).padStart(2, '0');

    const todayDateString = `${year}-${month}-${dayOfMonth}`;

    console.log('Сьогоднішня дата для пошуку:', todayDateString);
    this.daysJournal.forEach((day: any) => {
      if (day.date === todayDateString){
        day.data.forEach((day: any) => {
          if (day.isActive){
            this.settingsForm.patchValue({
              priorityGrid: day.priorityGrid,
              chargeFromGrid: day.chargeFromGrid,
              dischargeToGrid: day.dischargeToGrid,
              imbalances: day.imbalances,
              priorityPv: day.priorityPv,
              pv: day.pv,
              priorityBess: day.priorityBess,
              bess1Charge: day.bess1Charge,
              bess1Discharge: day.bess1Discharge,
              bess2Charge: day.bess2Charge,
              bess2Discharge: day.bess2Discharge,
            });
          }
        })
      }
    })

  }

  updateJournal(){
    this.isFormInitialized = false;
    this.controlStationService.getJournalToday().subscribe((data: any) => {
      console.log(data);
      this.mergeJournalData(data);
    })
  }

  isIntervalActive(item: any) {
   return item.isActive
  }

  protected readonly convertUtcToKyiv = convertUtcToKyiv;
}
