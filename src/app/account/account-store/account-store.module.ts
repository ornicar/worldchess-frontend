import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromAccount from './account.reducer';
import { AccountEffects } from './account.effects';
import { AccountResourceService } from './account-resource.service';


@NgModule({
  imports: [
    StoreModule.forFeature('account', fromAccount.reducer),
    EffectsModule.forFeature([
      AccountEffects
    ])
  ],
  providers: [
    AccountResourceService
  ]
})
export class AccountStoreModule {}