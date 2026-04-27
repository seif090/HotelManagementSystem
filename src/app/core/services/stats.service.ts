import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BookingService } from './booking.service';
import { RoomService } from './room.service';

export interface DailyStats {
  date: string;
  revenue: number;
  bookings: number;
  occupancyRate: number;
}

export interface MonthlyStats {
  month: string;
  revenue: number;
  bookings: number;
  newCustomers: number;
  avgStay: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private dailyStatsSubject = new BehaviorSubject<DailyStats[]>([]);
  private monthlyStatsSubject = new BehaviorSubject<MonthlyStats[]>([]);
  
  dailyStats$ = this.dailyStatsSubject.asObservable();
  monthlyStats$ = this.monthlyStatsSubject.asObservable();

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService
  ) {
    this.calculateStats();
  }

  calculateStats(): void {
    this.bookingService.getAllBookings().subscribe(bookings => {
      this.roomService.getAllRooms().subscribe(rooms => {
        const dailyStats = this.calculateDailyStats(bookings, rooms);
        this.dailyStatsSubject.next(dailyStats);
        const monthlyStats = this.calculateMonthlyStats(bookings, rooms);
        this.monthlyStatsSubject.next(monthlyStats);
      });
    });
  }

  private calculateDailyStats(bookings: any[], rooms: any[]): DailyStats[] {
    const stats: DailyStats[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBookings = bookings.filter(b => 
        b.checkIn <= dateStr && b.checkOut > dateStr
      );
      
      const revenue = dayBookings.reduce((sum, b) => sum + (b.totalPrice / this.getStayDuration(b.checkIn, b.checkOut)), 0);
      const occupancyRate = rooms.length > 0 ? (dayBookings.length / rooms.length) * 100 : 0;
      
      stats.push({
        date: dateStr,
        revenue: Math.round(revenue),
        bookings: dayBookings.length,
        occupancyRate: Math.round(occupancyRate * 10) / 10
      });
    }
    
    return stats;
  }

  private calculateMonthlyStats(bookings: any[], rooms: any[]): MonthlyStats[] {
    const stats: MonthlyStats[] = [];
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = (today.getMonth() - i + 12) % 12;
      const year = today.getFullYear() - (today.getMonth() - i < 0 ? 1 : 0);
      
      const monthBookings = bookings.filter(b => {
        const checkIn = new Date(b.checkIn);
        return checkIn.getMonth() === month && checkIn.getFullYear() === year;
      });
      
      const revenue = monthBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const avgStay = monthBookings.length > 0 
        ? monthBookings.reduce((sum, b) => sum + this.getStayDuration(b.checkIn, b.checkOut), 0) / monthBookings.length
        : 0;
      
      stats.push({
        month: `${months[month]} ${year}`,
        revenue: revenue,
        bookings: monthBookings.length,
        newCustomers: Math.floor(Math.random() * 5) + 1,
        avgStay: Math.round(avgStay * 10) / 10
      });
    }
    
    return stats;
  }

  private getStayDuration(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTotalRevenue(bookings: any[]): number {
    return bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  }

  getOccupancyRate(rooms: any[], bookings: any[]): number {
    if (rooms.length === 0) return 0;
    const occupiedRooms = new Set(
      bookings
        .filter(b => b.status === 'confirmed' || b.status === 'checked-in')
        .map(b => b.roomId)
    );
    return (occupiedRooms.size / rooms.length) * 100;
  }

  getUpcomingCheckIns(bookings: any[], days: number = 7): any[] {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    return bookings.filter(b => {
      const checkIn = new Date(b.checkIn);
      return checkIn >= today && checkIn <= futureDate && b.status === 'confirmed';
    });
  }
}
