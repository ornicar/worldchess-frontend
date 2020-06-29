import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

export interface IAlertWithCountdownWindowData {
  title: string;
  message: string;
  date: string;
}

@Component({
  selector: 'wc-alert-with-countdown',
  templateUrl: './alert-with-countdown.component.html',
  styleUrls: ['./alert-with-countdown.component.scss']
})
export class AlertWithCountdownComponent {
  constructor(
    private dialogRef: MatDialogRef<AlertWithCountdownComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAlertWithCountdownWindowData,
  ) {}
}
