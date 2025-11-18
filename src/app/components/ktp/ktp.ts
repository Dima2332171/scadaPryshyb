import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {filter, Subject, takeUntil} from 'rxjs';
import {Websocket} from '../../core/websocket';

@Component({
  selector: 'app-ktp',
  imports: [],
  templateUrl: './ktp.html',
  styleUrl: './ktp.css',
})
export class Ktp implements OnDestroy, OnChanges {
  @Output() viewChange = new EventEmitter<any>();
  @Input() id: any;

  private destroy$ = new Subject<void>();
  data: any;

  constructor(private ws: Websocket) {}

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
}
