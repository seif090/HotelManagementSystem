import { Component, OnInit, signal, computed } from '@angular/core';
import { BookingService, Booking } from '../../core/services/booking.service';
import { RoomService } from '../../core/services/room.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CalendarDay {
  number: number;
  isToday: boolean;
  otherMonth: boolean;
  date: string;
  bookings?: Booking[];
  hasBooking: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  bookings: Booking[] = [];
  rooms: any[] = [];
  selectedRoomId = signal<number | null>(null);
  showBookingModal = signal(false);
  selectedDate = signal('');
  
  today = new Date().toISOString().split('T')[0];
  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth();
  
  calendarDays = signal<CalendarDay[]>([]);

  newBooking = signal<Partial<Booking>>({
    customerId: 0,
    roomId: 0,
    checkIn: '',
    checkOut: '',
    totalPrice: 0,
    status: 'confirmed' as const
  });

  currentMonthName = computed(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months[this.currentMonth];
  });

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadBookingsAndRooms();
  }

  loadBookingsAndRooms(): void {
    this.bookingService.getAllBookings().subscribe(bookings => {
      this.bookings = bookings;
    });

    this.roomService.getAllRooms().subscribe(rooms => {
      this.rooms = rooms;
    });
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();
    
    const days: CalendarDay[] = [];
    
    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevMonthDays - i);
      days.push({
        number: prevMonthDays - i,
        isToday: false,
        otherMonth: true,
        date: date.toISOString().split('T')[0],
        bookings: this.getBookingsForDate(date.toISOString().split('T')[0]),
        hasBooking: false
      });
    }
    
    // Current month days
    const todayStr = this.today;
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayBookings = this.getBookingsForDate(dateStr);
      days.push({
        number: i,
        isToday: dateStr === todayStr,
        otherMonth: false,
        date: dateStr,
        bookings: dayBookings,
        hasBooking: dayBookings.length > 0
      });
    }
    
    // Next month days
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (startDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      days.push({
        number: i,
        isToday: false,
        otherMonth: true,
        date: date.toISOString().split('T')[0],
        bookings: this.getBookingsForDate(date.toISOString().split('T')[0]),
        hasBooking: false
      });
    }
    
    this.calendarDays.set(days);
  }

  getBookingsForDate(dateStr: string): Booking[] {
    return this.bookings.filter(b => b.checkIn <= dateStr && b.checkOut > dateStr);
  }

  getEventColor(booking: Booking): string {
    switch (booking.status) {
      case 'confirmed': return '#10b981';
      case 'checked-in': return '#f59e0b';
      case 'checked-out': return '#9ca3af';
      case 'cancelled': return '#ef4444';
      default: return '#3b82f6';
    }
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  selectDate(day: CalendarDay): void {
    if (!day.otherMonth) {
      this.selectedDate.set(day.date);
      this.selectedRoomId.set(null);
      this.showBookingModal.set(true);
    }
  }

  openEditModal(booking: Booking): void {
    this.newBooking.set({ ...booking });
    this.selectedRoomId.set(booking.roomId);
    this.showBookingModal.set(true);
  }

  closeModal(): void {
    this.showBookingModal.set(false);
    this.newBooking.set({
      customerId: 0,
      roomId: 0,
      checkIn: '',
      checkOut: '',
      totalPrice: 0,
      status: 'confirmed'
    });
  }

  saveBooking(): void {
    if (!this.validateBooking()) return;

    const bookingData = {
      ...this.newBooking(),
      checkIn: this.selectedDate() || this.newBooking().checkIn || this.today,
      roomId: this.selectedRoomId() || this.newBooking().roomId
    };

    if (this.newBooking().id) {
      this.bookingService.updateBooking(this.newBooking().id!, bookingData as Booking).subscribe(() => {
        this.loadBookingsAndRooms();
        this.closeModal();
      });
    } else {
      this.bookingService.addBooking(bookingData as any).subscribe(() => {
        this.loadBookingsAndRooms();
        this.closeModal();
      });
    }
  }

  validateBooking(): boolean {
    if (!this.newBooking().customerId || !this.newBooking().roomId) {
      return false;
    }
    return true;
  }

  get availableRooms() {
    return this.rooms.filter(r => r.status === 'available');
  }
}
