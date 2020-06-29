import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailInputComponent } from './email-input/email-input.component';
import { FullNameInputComponent } from './full-name-input/full-name-input.component';
import { PasswordInputComponent } from './password-input/password-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FirstNameInputComponent } from './first-name-input/first-name-input.component';
import { LastNameInputComponent } from './last-name-input/last-name-input.component';
import { CardNumberInputComponent } from './card/card-number-input/card-number-input.component';
import { CardNameInputComponent } from './card/card-name-input/card-name-input.component';
import { CardDateInputComponent } from './card/card-date-input/card-date-input.component';
import { CardCVCInputComponent } from './card/card-cvc-input/card-cvc-input.component';
import { CardPromoInputComponent } from './card/card-promo-input/card-promo-input.component';
import { NgxMaskModule } from 'ngx-mask';
import { RouterModule } from '@angular/router';
import { CheckboxControlComponent } from './checkbox-control/checkbox-control.component';
import { TextInputComponent } from './text-input/text-input.component';
import { SelectInputComponent } from './select-input/select-input.component';
import { FideIdInputComponent } from './fide-id-input/fide-id-input.component';
import { DatepickerInputComponent } from './datepicker-input/datepicker-input.component';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    // AppRoutingModule,
    NgxMaskModule.forRoot(),
    RouterModule,
    MatSelectModule,
    MatDatepickerModule,
    SharedModule
  ],
  declarations: [
    EmailInputComponent,
    PasswordInputComponent,
    FirstNameInputComponent,
    LastNameInputComponent,
    FullNameInputComponent,
    CardNumberInputComponent,
    CardNameInputComponent,
    CardDateInputComponent,
    CardCVCInputComponent,
    CardPromoInputComponent,
    CheckboxControlComponent,
    FideIdInputComponent,
    TextInputComponent,
    SelectInputComponent,
    DatepickerInputComponent
  ],
  exports: [
    EmailInputComponent,
    PasswordInputComponent,
    FirstNameInputComponent,
    LastNameInputComponent,
    FullNameInputComponent,
    CardNumberInputComponent,
    CardNameInputComponent,
    CardDateInputComponent,
    CardCVCInputComponent,
    CardPromoInputComponent,
    CheckboxControlComponent,
    FideIdInputComponent,
    TextInputComponent,
    SelectInputComponent,
    DatepickerInputComponent
  ]
})
export class FormHelperModule {
}
