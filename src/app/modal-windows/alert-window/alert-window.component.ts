import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { IOnlineTournament } from '@app/modules/game/tournaments/models/tournament.model';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
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

  @Select(TournamentState.getTournament) tournament$: Observable<IOnlineTournament>;

  constructor(
    private dialogRef: MatDialogRef<AlertWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAlertWindowData,
  ) { }

  public onClickOk() {
    this.dialogRef.close();

      this.tournament$.pipe(first()).subscribe((tournament) => {
        window['dataLayerPush'](
          'whcTournament',
          'Tournament',
          'Camera',
          'Tournaments icon',
          tournament.title,
          '',
          tournament.id,
          tournament.status === TournamentStatus.EXPECTED ? 'future' : tournament.status === TournamentStatus.GOES ? 'actual' : 'ended'
        );
      })
  }


}
