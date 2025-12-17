import {Injectable, NgZone} from '@angular/core';
import {filter, fromEvent, map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WindowVisibility {

  public readonly windowFocus$: Observable<void>;

  constructor(private ngZone: NgZone) {
    this.windowFocus$ = this.ngZone.runOutsideAngular(()=> {
      return fromEvent(document, 'visibilitychange').pipe(
        filter(()=> document.visibilityState === 'visible'),
        map(() => void 0)
      )
    })
  }
}
