import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ITeam } from '../../../core/team/team.model';
import { ITeamPlayer } from '../../team-players/team-players.model';

@Component({
  selector: 'wc-info-players',
  templateUrl: './info-players.component.html',
  styleUrls: ['./info-players.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoPlayersComponent implements OnInit, OnChanges {
  @Input() teams: ITeam[] = [];
  @Input() teamPlayers: ITeamPlayer[] = [];
  @Input() selectedTeam: ITeam = null;
  @Output() teamSelect = new EventEmitter<ITeam>();
  @Output() toggleModal = new EventEmitter<boolean>();

  public sortedTeamPlayers: ITeamPlayer[] = [];

  public isDropdownOpened = false;
  public selectedCountry = null;
  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.sortTeamPlayers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.teamPlayers) {
      this.sortTeamPlayers();
    }
  }

  public toggleDropdown(flag?: boolean) {
    if (flag !== undefined) {
      this.isDropdownOpened = flag;
    } else {
      this.isDropdownOpened = !this.isDropdownOpened;
    }
    this.cd.markForCheck();
  }

  public selectTeam(team: ITeam) {
    this.isDropdownOpened = false;
    this.teamSelect.emit(team);
    this.cd.markForCheck();
  }

  public compareTeamPlayers(a: ITeamPlayer, b: ITeamPlayer) {
    if (a.board_number < b.board_number) { return -1; }
    if (a.board_number > b.board_number) { return 1; }
    return 0;
  }

  public sortTeamPlayers(): void {
    this.sortedTeamPlayers = [...this.teamPlayers];
    this.sortedTeamPlayers.sort(this.compareTeamPlayers);
    this.cd.markForCheck();
  }
}
