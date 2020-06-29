import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {FavoriteBoardsEffects} from './favorite-boards.effects';
import * as fromFavoriteBoards from './favorite-boards.reducer';
import {FavoriteBoardsResourceService} from './favorite-boards-resource.service';

@NgModule({
  declarations: [],
  providers: [
    FavoriteBoardsResourceService
  ],
  imports: [
    CommonModule,
    StoreModule.forFeature('favorite-boards', fromFavoriteBoards.reducer),
    EffectsModule.forFeature([FavoriteBoardsEffects])
  ]
})
export class FavoriteBoardsModule { }
