import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild } from '@angular/core';

@Component({
  selector: 'wc-tournament-list-title',
  templateUrl: 'tournament-list-title.component.html',
  styleUrls: ['tournament-list-title.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TournamentListTitleComponent {
  @ContentChild('title', { read: TemplateRef, static: true }) title: TemplateRef<HTMLElement>;
}
