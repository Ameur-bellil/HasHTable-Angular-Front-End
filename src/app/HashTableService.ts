import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HashTableService {
  private baseUrl = 'http://localhost:8081/api/hashtable';

  constructor(private http: HttpClient) {}

  addWord(word: string): Observable<void> {
    const url = `${this.baseUrl}/add`;
    const params = new HttpParams().set('name', word);
    return this.http.post<void>(url, null, { params });
  }

  removeWord(word: string): Observable<void> {
    const url = `${this.baseUrl}/remove`;
    const params = new HttpParams().set('name', word);
    return this.http.delete<void>(url, { params });
  }

  searchWord(word: string): Observable<boolean> {
    const url = `${this.baseUrl}/contains`;
    const params = new HttpParams().set('name', word);
    return this.http.get<boolean>(url, { params });
  }

  getTable(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/print`);
  }
}
