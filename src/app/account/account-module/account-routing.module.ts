import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountRatingResolveGuard } from './account-rating-resolve.guard';
import { AccountComponent } from './account.component';
import { MembershipComponent } from './membership/membership.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileFideIdComponent } from './profile-fide-id/profile-fide-id.component';
import { CanUserCreateEventGuard } from './can-user-create-event.guard';
import { MyEventsComponent } from './my-events/my-events.component';
import { MyTournamentsListComponent } from './my-tournaments-list/my-tournaments-list.component';
import { ManageTournamentComponent } from './manage-tournament/manage-tournament.component';
import { ManageTournamentMainComponent } from './manage-tournament-main/manage-tournament-main.component';
import { ManageTournamentAddedComponent } from './manage-tournament-added/manage-tournament-added.component';
import { ManageTournamentRoundsComponent } from './manage-tournament-rounds/manage-tournament-rounds.component';
import { ManageTournamentPartnersComponent } from './manage-tournament-partners/manage-tournament-partners.component';
import { ManageTournamentPlayersComponent } from './manage-tournament-players/manage-tournament-players.component';
import { ManageTournamentWidgetsComponent } from './manage-tournament-widgets/manage-tournament-widgets.component';
import { AccountResolveGuard } from './account-resolve.guard';
import { ManageTournamentCamerasComponent } from './manage-tournament-cameras/manage-tournament-cameras.component';


const tournamentManagerChildren = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: ManageTournamentMainComponent
  },
  {
    path: 'added',
    component: ManageTournamentAddedComponent
  },
  {
    path: 'rounds',
    component: ManageTournamentRoundsComponent
  },
  {
    path: 'partners',
    component: ManageTournamentPartnersComponent
  },
  {
    path: 'players',
    component: ManageTournamentPlayersComponent
  },
  {
    path: 'widgets',
    component: ManageTournamentWidgetsComponent
  },
  {
    path: 'video_broadcast',
    component: ManageTournamentCamerasComponent,
  }
];

const routes: Routes = [
  {
    path: '',
    resolve: [
      AccountResolveGuard,
      AccountRatingResolveGuard,
    ],
    component: AccountComponent,
    children: [
      {
        path: '',
        redirectTo: 'membership',
        pathMatch: 'full'
      },
      {
        path: 'membership',
        component: MembershipComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'profile-fide-id',
        component: ProfileFideIdComponent
      },
      {
        path: 'events',
        canActivate: [
          CanUserCreateEventGuard
        ],
        children: [
          {
            path: '',
            component: MyEventsComponent,
            children: [
              {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
              },
              {
                path: 'list',
                component: MyTournamentsListComponent
              },
              {
                path: 'create/:id',
                component: ManageTournamentComponent,
                children: tournamentManagerChildren
              },
              {
                path: 'edit/:id',
                component: ManageTournamentComponent,
                children: tournamentManagerChildren
              },
              {
                path: 'view',
                component: ManageTournamentComponent
              }
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
