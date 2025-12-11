import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ControlStation {
  baseUrl = "http://localhost:8000";

  constructor(private http: HttpClient) {}

  getJournalToday(): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/journal-days`);
  }

  getSetPointToday(date: any): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/api/journal-day/${date}`);
  }
}
