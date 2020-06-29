import { Observable } from 'rxjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';
import 'hammerjs';
import { GameAppModule } from '@app/arena/game-app.module';

if (environment.production) {
  enableProdMode();
}

if (environment.debugger_on) {

}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic()
    .bootstrapModule(GameAppModule)
    .catch(err => console.error(err));
});
