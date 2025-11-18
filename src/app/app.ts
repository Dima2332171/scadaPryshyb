import {Component, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Theme} from './core/theme';
import { Websocket} from './core/websocket';
import {Main} from './components/main/main';
import {convertUtcToKyiv} from './core/date-time.utils';
import {Krpz} from './components/krpz/krpz';
import {Ktp} from './components/ktp/ktp';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Main, Krpz, Ktp],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Pryshyb');

  viewContainer: string = 'main';
  currentTheme: string;
  krpzId: any;
  ktpId: any;
  realTimeData: any = null;
  constructor(
    private themeService: Theme,
    private ws: Websocket,
  )
  {
    this.currentTheme = this.themeService.getCurrentTheme();
  }



  ngOnInit() {
    this.ws.data$.subscribe(data => {
      if (data?.type === 'realtime'){
        this.realTimeData = data;
      }
    })
    this.ws.connect();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  changeView(event:any){
    this.viewContainer = event.view;
    this.krpzId = event.id;
    this.ktpId = event.id;
  }

  get kyivTime(): string {
    const utc = this.realTimeData?.date;
    return utc ? convertUtcToKyiv(utc) : '--';
  }

  protected readonly convertUtcToKyiv = convertUtcToKyiv;
}
