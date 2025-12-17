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
    return this.http.get<any>(`${this.baseUrl}/journal-day/${date}`);
  }

  saveJournalDay(payload: any): Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/save-journal-day`,payload);
  }

  deleteJournalDay(date: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete-journal-day/${date}`);
  }

  deleteOverrideDay(date: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete-override-day/${date}`);
  }

  saveOverrideDay(payload: any): Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/save-override-day`,payload);
  }
}
