import { Component, OnInit, signal } from '@angular/core';
import { RoomService, Room } from '../../core/services/room.service';
import { BookingService, Booking } from '../../core/services/booking.service';
import { CustomerService } from '../../core/services/customer.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchType = signal<'rooms' | 'bookings'>('rooms');
  
  searchQuery = '';
  checkInDate = '';
  checkOutDate = '';
  roomType = '';
  minPrice = '';
  maxPrice = '';
  
  rooms: any[] = [];
  bookings: any[] = [];
  searchResults: any[] = [];
  loading = signal(false);
  
  roomTypes = ['Single', 'Double', 'Suite', 'Family'];

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    
    this.roomService.getAllRooms().subscribe(rooms => {
      this.rooms = rooms;
      this.searchResults = [...rooms];
      this.loading.set(false);
    });

    this.bookingService.getAllBookings().subscribe(bookings => {
      this.bookings = bookings;
    });
  }

  performSearch(): void {
    this.loading.set(true);
    
    if (this.searchType() === 'rooms') {
      this.searchResults = this.rooms.filter(room => {
        const matchesQuery = !this.searchQuery ||
          room.number.includes(this.searchQuery) ||
          room.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesType = !this.roomType || room.type === this.roomType;
        const matchesMinPrice = !this.minPrice || room.price >= parseFloat(this.minPrice);
        const matchesMaxPrice = !this.maxPrice || room.price <= parseFloat(this.maxPrice);
        
        if (this.checkInDate && this.checkOutDate) {
          const roomBookings = this.bookings.filter(b => b.roomId === room.id);
          const isAvailable = !roomBookings.some(b => 
            (this.checkInDate >= b.checkIn && this.checkInDate < b.checkOut) ||
            (this.checkOutDate > b.checkIn && this.checkOutDate <= b.checkOut)
          );
          return matchesQuery && matchesType && matchesMinPrice && matchesMaxPrice && (room.status === 'available' && isAvailable);
        }
        
        return matchesQuery && matchesType && matchesMinPrice && matchesMaxPrice;
      });
    } else {
      this.searchResults = this.bookings.filter(booking => {
        const matchesQuery = !this.searchQuery ||
          booking.customer?.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          booking.room?.number.includes(this.searchQuery) ||
          booking.checkIn.includes(this.searchQuery) ||
          booking.checkOut.includes(this.searchQuery);
        
        if (this.checkInDate) {
          return matchesQuery && booking.checkIn >= this.checkInDate;
        }
        if (this.checkOutDate) {
          return matchesQuery && booking.checkOut <= this.checkOutDate;
        }
        
        return matchesQuery;
      });
    }
    
    this.loading.set(false);
  }

  getStatusClass(status: string): string {
    return {
      'available': 'success',
      'occupied': 'warning',
      'maintenance': 'danger',
      'confirmed': 'success',
      'cancelled': 'danger',
      'checked-in': 'warning',
      'checked-out': 'info'
    }[status] || 'info';
  }

  getStatusLabel(status: string): string {
    const roomLabels: {[key: string]: string} = {
      'available': 'متاحة',
      'occupied': 'مشغولة',
      'maintenance': 'صيانة'
    };
    const bookingLabels: {[key: string]: string} = {
      'confirmed': 'مؤكد',
      'cancelled': 'ملغي',
      'checked-in': 'تم تسجيل الدخول',
      'checked-out': 'تم تسجيل الخروج'
    };
    return this.searchType() === 'rooms' ? roomLabels[status] || status : bookingLabels[status] || status;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.checkInDate = '';
    this.checkOutDate = '';
    this.roomType = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.searchResults = this.searchType() === 'rooms' ? [...this.rooms] : [...this.bookings];
  }
}
