import { Component, OnInit, signal } from '@angular/core';
import { CustomerService, Customer } from '../../core/services/customer.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = signal(false);
  searchQuery = '';
  
  showModal = signal(false);
  editingCustomer: Customer | null = null;
  
  newCustomer = signal({
    name: '',
    email: '',
    phone: '',
    nationalId: ''
  });

  constructor(
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.customerService.getAllCustomers().subscribe(customers => {
      this.customers = customers;
      this.filteredCustomers = [...customers];
      this.loading.set(false);
    });
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      return !this.searchQuery ||
        customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        customer.phone.includes(this.searchQuery) ||
        customer.nationalId.includes(this.searchQuery);
    });
  }

  openAddModal(): void {
    this.editingCustomer = null;
    this.newCustomer.set({
      name: '',
      email: '',
      phone: '',
      nationalId: ''
    });
    this.showModal.set(true);
  }

  openEditModal(customer: Customer): void {
    this.editingCustomer = customer;
    this.newCustomer.set({ ...customer });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCustomer = null;
  }

  saveCustomer(): void {
    if (!this.validateCustomer()) return;
    
    if (this.editingCustomer) {
      this.customerService.updateCustomer(this.editingCustomer.id, this.newCustomer()).subscribe(() => {
        this.notificationService.showSuccess('تم تحديث بيانات العميل بنجاح');
        this.loadCustomers();
        this.closeModal();
      });
    } else {
      this.customerService.addCustomer(this.newCustomer()).subscribe(() => {
        this.notificationService.showSuccess('تمت إضافة العميل بنجاح');
        this.loadCustomers();
        this.closeModal();
      });
    }
  }

  deleteCustomer(customer: Customer): void {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      this.customerService.deleteCustomer(customer.id).subscribe(() => {
        this.notificationService.showSuccess('تم حذف العميل بنجاح');
        this.loadCustomers();
      });
    }
  }

  validateCustomer(): boolean {
    const { name, email, phone, nationalId } = this.newCustomer();
    if (!name || !email || !phone || !nationalId) {
      this.notificationService.showError('يرجى تعبئة جميع الحقول المطلوبة');
      return false;
    }
    if (!this.validateEmail(email)) {
      this.notificationService.showError('يرجى إدخال بريد إلكتروني صالح');
      return false;
    }
    return true;
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
