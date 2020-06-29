import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface IConfirmWindowData {
  title: string;
  message: string;
  buttonTrue?: string;
  buttonFalse?: string;
}

@Component({
  selector: 'confirm-window',
  templateUrl: 'confirm-window.component.html',
  styleUrls: ['confirm-window.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmWindowComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IConfirmWindowData,
  ) { }

  public onClickOk(): void {
    this.dialogRef.close(true);
  }

  public onClickCancel(): void {
    this.dialogRef.close(false);
  }
}
