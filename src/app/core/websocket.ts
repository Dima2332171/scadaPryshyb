import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class Websocket {
  private ws!: WebSocket;
  private dataSubject = new BehaviorSubject<any>(null);
  public data$ = this.dataSubject.asObservable();

  connect(url: string = 'ws://localhost:8000/ws') {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Websocket opened');
    }

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'realtime') {
        this.dataSubject.next(msg);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket отключён');
      setTimeout(() => this.connect(url), 2000); // reconnect
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket ошибка:', err);
    };
  }

  send(data: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }


}
