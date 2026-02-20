import { Component, signal } from '@angular/core';
import { ServiceDirectoryService } from 'src/app/services/apps/service-directory/service-directory.service';
import { ServiceDirectory } from './service-directory';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-service-directory',
  templateUrl: './service-directory.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    TablerIconsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    RouterModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class ServiceDirectoryComponent {
  serviceList = signal<ServiceDirectory[]>([]);
  selectedCategory = signal<string>('All');

  constructor(private serviceDirectoryService: ServiceDirectoryService) {
    this.serviceList.set(this.serviceDirectoryService.getServiceDirectory());
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.serviceList.set(this.filter(filterValue));
  }

  filter(v: string): ServiceDirectory[] {
    return this.serviceDirectoryService
      .getServiceDirectory()
      .filter(
        (x) => x.serviceName.toLowerCase().indexOf(v.toLowerCase()) !== -1
      );
  }

  ddlChange(event: any): void {
    const selectedValue = event.value;
    this.selectedCategory.set(selectedValue);
    
    if (selectedValue === 'All') {
      this.serviceList.set(this.serviceDirectoryService.getServiceDirectory());
    } else {
      const filteredServices = this.serviceDirectoryService
        .getServiceDirectory()
        .filter((x) => x.serviceCategory === selectedValue);
      this.serviceList.set(filteredServices);
    }
  }
}
