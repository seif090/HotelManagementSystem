import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { RoomService, Room } from './room.service';
import { CustomerService, Customer } from './customer.service';

export interface Booking {
  id: number;
  customerId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'checked-in' | 'checked-out';
  createdAt: string;
  customer?: Customer;
  room?: Room;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();

  private mockBookings: Booking[] = [
    {
      id: 1,
      customerId: 1,
      roomId: 2,
      checkIn: '2024-06-15',
      checkOut: '2024-06-18',
      totalPrice: 750,
      status: 'confirmed',
      createdAt: '2024-05-01'
    },
    {
      id: 2,
      customerId: 2,
      roomId: 3,
      checkIn: '2024-06-20',
      checkOut: '2024-06-25',
      totalPrice: 2250,
      status: 'confirmed',
      createdAt: '2024-05-10'
    },
    {
      id: 3,
      customerId: 3,
      roomId: 5,
      checkIn: '2024-05-01',
      checkOut: '2024-05-05',
      totalPrice: 1120,
      status: 'checked-out',
      createdAt: '2024-04-15'
    },
    {
      id: 4,
      customerId: 5,
      roomId: 6,
      checkIn: '2024-07-01',
      checkOut: '2024-07-07',
      totalPrice: 3000,
      status: 'confirmed',
      createdAt: '2024-06-01'
    },
  ];

  constructor(private roomService: RoomService, private customerService: CustomerService) {
    this.enrichBookings();
    this.bookingsSubject.next([...this.mockBookings]);
  }

  private enrichBookings(): void {
    this.mockBookings.forEach(booking => {
      booking.room = this.roomService['mockRooms'].find(r => r.id === booking.roomId);
      booking.customer = this.customerService['mockCustomers'].find(c => c.id === booking.customerId);
    });
  }

  getAllBookings(): Observable<Booking[]> {
    return of([...this.mockBookings]).pipe(
      catchError(this.handleError<Booking[]>('getAllBookings', []))
    );
  }

  getBooking(id: number): Observable<Booking | undefined> {
    return this.bookings$.pipe(
      map(bookings => bookings.find(b => b.id === id)),
      catchError(this.handleError<Booking | undefined>('getBooking', undefined))
    );
  }

  addBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Observable<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: Math.max(...this.mockBookings.map(b => b.id)) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.mockBookings.push(newBooking);
    this.enrichBookings();
    this.bookingsSubject.next([...this.mockBookings]);
    return of(newBooking);
  }

  updateBooking(id: number, booking: Partial<Booking>): Observable<Booking> {
    const index = this.mockBookings.findIndex(b => b.id === id);
    if (index > -1) {
      this.mockBookings[index] = { ...this.mockBookings[index], ...booking };
      this.enrichBookings();
      this.bookingsSubject.next([...this.mockBookings]);
    }
    return of(this.mockBookings[index]);
  }

  deleteBooking(id: number): Observable<boolean> {
    const index = this.mockBookings.findIndex(b => b.id === id);
    if (index > -1) {
      this.mockBookings.splice(index, 1);
      this.enrichBookings();
      this.bookingsSubject.next([...this.mockBookings]);
    }
    return of(true);
  }

  updateBookingStatus(id: number, status: Booking['status']): Observable<Booking> {
    return this.updateBooking(id, { status });
  }

  getBookingsForRoom(roomId: number): Observable<Booking[]> {
    return this.bookings$.pipe(
      map(bookings => bookings.filter(b => b.roomId === roomId)),
      catchError(this.handleError<Booking[]>(`getBookingsForRoom roomId=${roomId}`, []))
    );
  }

  getBookingsForDateRange(startDate: string, endDate: string): Observable<Booking[]> {
    return this.bookings$.pipe(
      map(bookings => bookings.filter(b => b.checkIn >= startDate && b.checkOut <= endDate)),
      catchError(this.handleError<Booking[]>(`getBookingsForDateRange`, []))
    );
  }

  calculatePrice(roomPrice: number, checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return roomPrice * diffDays;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
