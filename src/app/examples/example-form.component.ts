import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { LookupService, PremiseType } from 'src/app/services/lookup.service';

/**
 * Example component showing how to use the LookupService
 * for form dropdowns
 */
@Component({
  selector: 'app-example-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  template: `
    <mat-card>
      <mat-card-content>
        <form [formGroup]="exampleForm">
          <mat-form-field class="w-100">
            <mat-label>Premise Type</mat-label>
            <mat-select formControlName="premiseType">
              <mat-option *ngFor="let type of premiseTypes" [value]="type.id">
                {{ type.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div *ngIf="selectedPremiseTypeName">
            Selected: {{ selectedPremiseTypeName }}
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class ExampleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lookupService = inject(LookupService);

  exampleForm: FormGroup;
  premiseTypes: PremiseType[] = [];
  selectedPremiseTypeName: string = '';

  constructor() {
    this.exampleForm = this.fb.group({
      premiseType: [null]
    });
  }

  ngOnInit(): void {
    // Load premise types
    this.loadPremiseTypes();

    // Watch for changes to get the selected name
    this.exampleForm.get('premiseType')?.valueChanges.subscribe(id => {
      if (id) {
        this.lookupService.getPremiseTypeName(id).subscribe(name => {
          this.selectedPremiseTypeName = name;
        });
      }
    });
  }

  loadPremiseTypes(): void {
    this.lookupService.getPremiseTypes().subscribe(types => {
      this.premiseTypes = types;
    });
  }
}
