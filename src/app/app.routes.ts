import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RoomsComponent } from './features/rooms/rooms.component';
import { CustomersComponent } from './features/customers/customers.component';
import { BookingsComponent } from './features/bookings/bookings.component';
import { CalendarComponent } from './features/calendar/calendar.component';
import { SearchComponent } from './features/search/search.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'rooms',
    component: RoomsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'customers',
    component: CustomersComponent,
    canActivate: [authGuard]
  },
  {
    path: 'bookings',
    component: BookingsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    canActivate: [authGuard]
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

