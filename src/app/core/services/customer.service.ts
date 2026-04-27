import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  bookingsCount: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  customers$ = this.customersSubject.asObservable();

  private mockCustomers: Customer[] = [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', phone: '+966501234567', nationalId: '1010101010', bookingsCount: 5, createdAt: '2024-01-15' },
    { id: 2, name: 'سارة علي', email: 'sara@example.com', phone: '+966502345678', nationalId: '2020202020', bookingsCount: 3, createdAt: '2024-02-20' },
    { id: 3, name: 'خالد عبدالله', email: 'khalid@example.com', phone: '+966503456789', nationalId: '3030303030', bookingsCount: 8, createdAt: '2024-03-10' },
    { id: 4, name: 'فاطمة حسن', email: 'fatima@example.com', phone: '+966504567890', nationalId: '4040404040', bookingsCount: 2, createdAt: '2024-04-05' },
    { id: 5, name: 'محمد علي', email: 'mohamed@example.com', phone: '+966505678901', nationalId: '5050505050', bookingsCount: 12, createdAt: '2024-05-12' },
  ];

  constructor() {
    this.customersSubject.next([...this.mockCustomers]);
  }

  getAllCustomers(): Observable<Customer[]> {
    return of([...this.mockCustomers]).pipe(
      catchError(this.handleError<Customer[]>('getAllCustomers', []))
    );
  }

  getCustomer(id: number): Observable<Customer | undefined> {
    return this.customers$.pipe(
      map(customers => customers.find(c => c.id === id)),
      catchError(this.handleError<Customer | undefined>('getCustomer', undefined))
    );
  }

  addCustomer(customer: Omit<Customer, 'id' | 'bookingsCount' | 'createdAt'>): Observable<Customer> {
    const newCustomer: Customer = {
      ...customer,
      id: Math.max(...this.mockCustomers.map(c => c.id)) + 1,
      bookingsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.mockCustomers.push(newCustomer);
    this.customersSubject.next([...this.mockCustomers]);
    return of(newCustomer);
  }

  updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index > -1) {
      this.mockCustomers[index] = { ...this.mockCustomers[index], ...customer };
      this.customersSubject.next([...this.mockCustomers]);
    }
    return of(this.mockCustomers[index]);
  }

  deleteCustomer(id: number): Observable<boolean> {
    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index > -1) {
      this.mockCustomers.splice(index, 1);
      this.customersSubject.next([...this.mockCustomers]);
    }
    return of(true);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
