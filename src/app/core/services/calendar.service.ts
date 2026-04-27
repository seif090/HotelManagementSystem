import { Injectable } from '@angular/core';
import { BookingService } from './booking.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  constructor(private bookingService: BookingService) {}

  getEventsForDateRange(startDate: string, endDate: string) {
    return this.bookingService.getBookingsForDateRange(startDate, endDate);
  }
}
