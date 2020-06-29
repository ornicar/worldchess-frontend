import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

import { HeaderComponent as HeaderComponentBase } from '../../../broadcast/components/header/header.component';

@Component({
  selector: 'wcd-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends HeaderComponentBase {
  applicationUrl = environment.applicationUrl;
}
