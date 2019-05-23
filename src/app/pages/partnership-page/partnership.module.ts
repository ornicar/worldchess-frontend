import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
// import {PartnershipService} from './partnership.service';
// import {RbccPageComponent} from './rbcc/rbcc-page.component';
import {HttpClientModule} from '@angular/common/http';
import {PartnershipComponent} from '../../components/partnership/partnership.component';
import {LayoutModule} from '../../layout/layout.module';
import {PartnersModule} from '../../partners/partners.module';
import {PartnershipPageComponent} from './partnership/partnership-page.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    PartnersModule,
    LayoutModule
  ],
  providers: [
    // PartnershipService
  ],
  declarations: [
    PartnershipPageComponent,
    PartnershipComponent,
    // PartnershipPageComponent
    // RbccPageComponent
  ],
  exports: [
    PartnershipPageComponent
  ]
})
export class PartnershipModule {
}
