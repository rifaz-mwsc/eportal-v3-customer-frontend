import { Component } from '@angular/core';
import {
FormBuilder,
FormsModule,
ReactiveFormsModule,
Validators,
} from '@angular/forms';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-add-business',
  imports: [	MaterialModule,
FormsModule,
ReactiveFormsModule,],
  templateUrl: './add-business.component.html',
  styleUrl: './add-business.component.scss',
})
export class AddBusinessComponent {
  	firstFormGroup = this._formBuilder.group({
firstCtrl: ['', Validators.required],
});
secondFormGroup = this._formBuilder.group({
secondCtrl: ['', Validators.required],
});
constructor(private _formBuilder: FormBuilder) {}

}
