import { Component, OnInit, signal } from '@angular/core';
import { RoomService, Room } from '../../core/services/room.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  loading = signal(false);
  searchQuery = '';
  filterStatus = '';
  filterType = '';
  
  roomTypes = ['Single', 'Double', 'Suite', 'Family'];
  
  showModal = signal(false);
  editingRoom: Room | null = null;
  
  newRoom = signal<Room>({
    id: 0,
    number: '',
    type: 'Single',
    price: 0,
    capacity: 1,
    floor: 1,
    description: '',
    amenities: [],
    status: 'available'
  });

  constructor(
    private roomService: RoomService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading.set(true);
    this.roomService.getAllRooms().subscribe(rooms => {
      this.rooms = rooms;
      this.filteredRooms = [...rooms];
      this.loading.set(false);
    });
  }

  applyFilters(): void {
    this.filteredRooms = this.rooms.filter(room => {
      const matchesSearch = !this.searchQuery || 
        room.number.includes(this.searchQuery) ||
        room.type.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.filterStatus || room.status === this.filterStatus;
      const matchesType = !this.filterType || room.type === this.filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  openAddModal(): void {
    this.editingRoom = null;
    this.newRoom.set({
      id: 0,
      number: '',
      type: 'Single',
      price: 0,
      capacity: 1,
      floor: 1,
      description: '',
      amenities: [],
      status: 'available'
    });
    this.showModal.set(true);
  }

  openEditModal(room: Room): void {
    this.editingRoom = room;
    this.newRoom.set({ ...room });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingRoom = null;
  }

  saveRoom(): void {
    if (this.editingRoom) {
      this.roomService.updateRoom(this.editingRoom.id, this.newRoom()).subscribe(() => {
        this.notificationService.showSuccess('تم تحديث الغرفة بنجاح');
        this.loadRooms();
        this.closeModal();
      });
    } else {
      this.roomService.addRoom(this.newRoom()).subscribe(() => {
        this.notificationService.showSuccess('تمت إضافة الغرفة بنجاح');
        this.loadRooms();
        this.closeModal();
      });
    }
  }

  deleteRoom(room: Room): void {
    if (confirm('هل أنت متأكد من حذف هذه الغرفة؟')) {
      this.roomService.deleteRoom(room.id).subscribe(() => {
        this.notificationService.showSuccess('تم حذف الغرفة بنجاح');
        this.loadRooms();
      });
    }
  }

  updateStatus(room: Room, status: Room['status']): void {
    this.roomService.updateRoomStatus(room.id, status).subscribe(() => {
      this.notificationService.showSuccess('تم تحديث حالة الغرفة');
      this.loadRooms();
    });
  }

  toggleAmenity(amenity: string): void {
    const amenities = this.newRoom().amenities;
    const index = amenities.indexOf(amenity);
    if (index > -1) {
      amenities.splice(index, 1);
    } else {
      amenities.push(amenity);
    }
    this.newRoom.set({ ...this.newRoom(), amenities });
  }

  getStatusClass(status: string): string {
    return {
      'available': 'success',
      'occupied': 'warning',
      'maintenance': 'danger'
    }[status] || 'info';
  }

  getStatusLabel(status: string): string {
    return {
      'available': 'متاحة',
      'occupied': 'مشغولة',
      'maintenance': 'صيانة'
    }[status] || status;
  }
}
