import {
  Component,
  AfterViewInit,
  ViewChild,
  Signal,
  signal,
} from '@angular/core';
import { ApplicationService } from 'src/app/services/apps/application/application.service';
import { Application } from '../application';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-application-list',
  templateUrl: './application-list.component.html',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
})
export class AppMyApplicationListComponent implements AfterViewInit {
  allComplete = signal<boolean>(false);
  applicationList = new MatTableDataSource<Application>([]);
  activeTab = signal<string>('All');
  allApplications = signal<Application[]>([]);
  searchQuery = signal<string>('');
  displayedColumns: string[] = [
    'chk',
    'id',
    'serviceType',
    'applicantName',
    'applicationDate',
    'grandTotal',
    'status',
    'action',
  ];

  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);

  constructor(
    private applicationService: ApplicationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.allApplications.set(this.applicationService.getApplications());
    this.applicationList = new MatTableDataSource(this.allApplications());
  }

  ngAfterViewInit(): void {
    this.applicationList.paginator = this.paginator;
    this.applicationList.sort = this.sort;
  }

  handleTabClick(tab: string): void {
    this.activeTab.set(tab);
    this.filterApplications();
  }

  filter(filterValue: string): void {
    this.searchQuery.set(filterValue);
    this.filterApplications();
  }

  filterApplications(): void {
    const currentTab = this.activeTab();
    const filteredApplications = this.allApplications().filter((application) => {
      const matchesTab = currentTab === 'All' || application.status === currentTab;

      const matchesSearch =
        application.serviceType
          .toLowerCase()
          .includes(this.searchQuery().toLowerCase()) ||
        application.applicantName
          .toLowerCase()
          .includes(this.searchQuery().toLowerCase());

      return matchesTab && matchesSearch;
    });

    this.applicationList.data = filteredApplications;
    this.updateAllComplete();
  }

  updateAllComplete(): void {
    const allApplications = this.applicationList.data;
    this.allComplete.set(
      allApplications.length > 0 && allApplications.every((t) => t.completed)
    );
  }

  someComplete(): boolean {
    return (
      this.applicationList.data.filter((t) => t.completed).length > 0 &&
      !this.allComplete()
    );
  }

  setAll(completed: boolean): void {
    this.allComplete.set(completed);
    this.applicationList.data.forEach((t) => (t.completed = completed));
    this.applicationList._updateChangeSubscription();
  }

  countApplicationsByStatus(status: string): number {
    return this.allApplications().filter(
      (application) => application.status === status
    ).length;
  }

  deleteApplication(id: number): void {
    if (confirm('Are you sure you want to delete this application?')) {
      this.applicationService.deleteApplication(id);
      this.allApplications.set(this.applicationService.getApplications());
      this.filterApplications();
      this.showSnackbar('Application deleted successfully!');
    }
  }

  showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
