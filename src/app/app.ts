import {Component, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Theme} from './core/services/theme';
import { Websocket} from './core/services/websocket';
import {Main} from './components/main/main';
import {convertUtcToKyiv} from './core/services/date-time.utils';
import {Krpz} from './components/krpz/krpz';
import {Ktp} from './components/ktp/ktp';
import {MvcControl} from './components/mvc-control/mvc-control';
import {MvcEditDay} from './components/mvc-edit-day/mvc-edit-day';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Main, Krpz, Ktp, MvcControl, MvcEditDay],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Pryshyb');

  viewContainer: string = 'main';
  currentTheme: string;
  krpzId: any;
  ktpId: any;
  mvcId: any;
  day: any;
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
        this.realTimeData = data;
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
    this.mvcId = event.id;
    this.day = event.id;
  }

  get kyivTime(): string {
    const utc = this.realTimeData?.date;
    return utc ? convertUtcToKyiv(utc) : '--';
  }

  protected readonly convertUtcToKyiv = convertUtcToKyiv;
}
