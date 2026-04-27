import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface Room {
  id: number;
  number: string;
  type: string;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  capacity: number;
  floor: number;
  description: string;
  amenities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private roomsSubject = new BehaviorSubject<Room[]>([]);
  rooms$ = this.roomsSubject.asObservable();

  // Mock data
  private mockRooms: Room[] = [
    { id: 1, number: '101', type: 'Single', price: 150, status: 'available', capacity: 1, floor: 1, description: 'غرفة فردية مريحة', amenities: ['WiFi', 'AC', 'TV'] },
    { id: 2, number: '102', type: 'Double', price: 250, status: 'occupied', capacity: 2, floor: 1, description: 'غرفة مزدوجة واسعة', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'] },
    { id: 3, number: '103', type: 'Suite', price: 450, status: 'available', capacity: 4, floor: 2, description: 'جناح فاخر', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi'] },
    { id: 4, number: '104', type: 'Single', price: 150, status: 'maintenance', capacity: 1, floor: 1, description: 'غرفة فردية', amenities: ['WiFi', 'AC'] },
    { id: 5, number: '201', type: 'Double', price: 280, status: 'available', capacity: 2, floor: 2, description: 'غرفة مزدوجة', amenities: ['WiFi', 'AC', 'TV', 'Balcony'] },
    { id: 6, number: '202', type: 'Suite', price: 500, status: 'occupied', capacity: 4, floor: 2, description: 'جناح فاخر بإطلالة بحرية', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi', 'Balcony'] },
    { id: 7, number: '203', type: 'Single', price: 160, status: 'available', capacity: 1, floor: 2, description: 'غرفة فردية حديثة', amenities: ['WiFi', 'AC', 'TV', 'Work Desk'] },
    { id: 8, number: '301', type: 'Family', price: 350, status: 'available', capacity: 6, floor: 3, description: 'غرفة عائلية كبيرة', amenities: ['WiFi', 'AC', 'TV', 'Kitchen', 'Balcony'] },
  ];

  constructor(private http: HttpClient) {
    this.roomsSubject.next([...this.mockRooms]);
  }

  getAllRooms(): Observable<Room[]> {
    // In real app: return this.http.get<Room[]>('/api/rooms').pipe(
    return of([...this.mockRooms]).pipe(
      catchError(this.handleError<Room[]>('getAllRooms', []))
    );
  }

  getRoom(id: number): Observable<Room | undefined> {
    return this.rooms$.pipe(
      map(rooms => rooms.find(r => r.id === id)),
      catchError(this.handleError<Room | undefined>('getRoom', undefined))
    );
  }

  addRoom(room: Omit<Room, 'id'>): Observable<Room> {
    const newRoom: Room = {
      ...room,
      id: Math.max(...this.mockRooms.map(r => r.id)) + 1
    };
    this.mockRooms.push(newRoom);
    this.roomsSubject.next([...this.mockRooms]);
    return of(newRoom);
  }

  updateRoom(id: number, room: Partial<Room>): Observable<Room> {
    const index = this.mockRooms.findIndex(r => r.id === id);
    if (index > -1) {
      this.mockRooms[index] = { ...this.mockRooms[index], ...room };
      this.roomsSubject.next([...this.mockRooms]);
    }
    return of(this.mockRooms[index]);
  }

  deleteRoom(id: number): Observable<boolean> {
    const index = this.mockRooms.findIndex(r => r.id === id);
    if (index > -1) {
      this.mockRooms.splice(index, 1);
      this.roomsSubject.next([...this.mockRooms]);
    }
    return of(true);
  }

  updateRoomStatus(id: number, status: Room['status']): Observable<Room> {
    return this.updateRoom(id, { status });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
