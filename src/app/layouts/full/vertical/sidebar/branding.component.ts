import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branding',
  imports: [RouterModule, CommonModule],
  template: `
    <a [routerLink]="['/']">
      @if(options.sidenavCollapsed) {
        <img
          src="./assets/images/logos/MWSCSqure Small.png"
          class="align-middle m-2"
          alt="logo"
          style="max-height: 40px;"
        />
      } @else {
        <img
          src="./assets/images/logos/logo-sm.png"
          class="align-middle m-2"
          alt="logo"
        />
      }
    </a>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  constructor(private settings: CoreService) {} 
}
