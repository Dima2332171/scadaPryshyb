import {
  Component, EventEmitter, Input, OnChanges, OnDestroy,
  Output, SimpleChanges
} from '@angular/core';
import { Websocket } from '../../core/services/websocket';
import { filter, Subject, takeUntil } from 'rxjs';
import {DecimalPipe, UpperCasePipe} from '@angular/common';

@Component({
  selector: 'app-krpz',
  imports: [
    DecimalPipe,
    UpperCasePipe
  ],
  templateUrl: './krpz.html',
  styleUrl: './krpz.css',
})
export class Krpz implements OnChanges, OnDestroy {

  @Output() viewChange = new EventEmitter<any>();
  @Input() id: any;

  private destroy$ = new Subject<void>();
  data: any;

  constructor(private ws: Websocket) {}

  openView(view: string, id?: number) {
    this.viewChange.emit({ view, id });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {

      this.destroy$.next();

      this.ws.data$
        .pipe(
          filter((d: any) => d?.type === 'realtime'),
          takeUntil(this.destroy$)
        )
        .subscribe(d => {
          const found = d.krpz?.find((x: any) => +x.id === +this.id);

          if (found) {
            this.data = { ...found };
            console.log('KRPZ-DATA:', this.data);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get satec() {
    return this.data?.satec;
  }

  getLineVoltage(ph: string): number {
    if (ph === 'a') return this.satec?.u_ab || 0;
    if (ph === 'b') return this.satec?.u_bc || 0;
    if (ph === 'c') return this.satec?.u_ca || 0;
    return 0;
  }
}
