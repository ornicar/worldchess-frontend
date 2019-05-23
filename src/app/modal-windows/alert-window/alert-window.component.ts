import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface IAlertWindowData {
  title: string;
  message: string;
}

@Component({
  selector: 'alert-window',
  templateUrl: 'alert-window.component.html',
  styleUrls: ['alert-window.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertWindowComponent {
  constructor(
    private dialogRef: MatDialogRef<AlertWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAlertWindowData,
  ) { }

  public onClickOk() {
    this.dialogRef.close();
  }
}
