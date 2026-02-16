import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-linked-business',
  imports: [MaterialModule],
  templateUrl: './no-linked-business.component.html',
  styleUrls: ['./no-linked-business.component.scss'],
})
export class NoLinkedBusinessComponent {
  constructor(private router: Router) {}

  goToAddBusiness() {
    this.router.navigate(['apps/business/add']);
  }
}
