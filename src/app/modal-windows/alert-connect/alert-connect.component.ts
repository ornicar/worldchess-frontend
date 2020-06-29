import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface IAlertConnectData {
  message: string;
}

@Component({
  selector: 'alert-connect',
  templateUrl: 'alert-connect.component.html',
  styleUrls: ['alert-connect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertConnectComponent {

  constructor(
    private dialogRef: MatDialogRef<AlertConnectComponent>,
  ) { }
}
