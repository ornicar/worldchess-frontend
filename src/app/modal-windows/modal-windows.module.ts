import { NgModule } from '@angular/core';
import { ModalWindowsService } from './modal-windows.service';
import { AlertWindowComponent } from './alert-window/alert-window.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material';
import { BugReportWindowComponent } from './bug-report-window/bug-report-window.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
      AlertWindowComponent,
      BugReportWindowComponent,
  ],
  entryComponents: [
    AlertWindowComponent,
    BugReportWindowComponent,
  ],
  imports: [
      CommonModule,
      MatDialogModule,
      FormsModule,
  ],
  providers: [
      ModalWindowsService,
  ],
})
export class ModalWindowsModule { }
