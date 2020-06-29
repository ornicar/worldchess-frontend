import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ISettingsGameAccount } from '@app/account/account-store/account.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'wc-game-settings-windows',
  templateUrl: './game-settings-windows.component.html',
  styleUrls: ['./game-settings-windows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameSettingsWindowsComponent {

  constructor(
    private dialogRef: MatDialogRef<GameSettingsWindowsComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: ISettingsGameAccount,
  ) {
    console.log('->', translateService.currentLang);
    // See https://github.com/ngrx/platform/issues/664 last commented maybe bug NgRx
    this.data = {...this.data};
   }
}
