import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {filter, Observable, Subject, takeUntil} from 'rxjs';
import {Websocket} from '../../core/services/websocket';
import {DecimalPipe, UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-ktp',
  imports: [
    DecimalPipe,
    UpperCasePipe
  ],
  templateUrl: './ktp.html',
  styleUrl: './ktp.css',
})
export class Ktp implements OnDestroy, OnChanges {
  @Output() viewChange = new EventEmitter<any>();
  @Input() id: any;

  private destroy$ = new Subject<void>();
  data: any;
  stringRows = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) => r * 4 + c + 1)
  );



  constructor(
    private ws: Websocket,
  )
  {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {

      this.destroy$.next();

      this.ws.data$
        .pipe(
          filter((d: any) => d?.type === 'realtime'),
          takeUntil(this.destroy$)
        )
        .subscribe(d => {
          const found = d.ktp?.find((x: any) => +x.id === +this.id);

          if (found) {
            this.data = { ...found };
            console.log('KTP-DATA:', this.data);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openView(view: string, id?: number) {
    this.viewChange.emit({ view, id });
  }



  get totalPower(): number {
    return this.data?.inverters?.reduce((s: number, i: any) => s + (i.a_power || 0), 0) || 0;
  }

  weakStrings(inv: any): number {
    if (!inv) return 0;
    return Object.keys(inv).filter(k => k.startsWith('i_br_') && inv[k] < 40).length;
  }
}
