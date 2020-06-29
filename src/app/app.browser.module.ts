import { BrowserModule, BrowserTransferStateModule } from "@angular/platform-browser";
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { UniversalInterceptor } from "./universal.interceptor";
import { AppModule } from "./app.module";

@NgModule({
  imports: [
    AppModule,
    BrowserModule.withServerTransition({ appId: 'world-chess' }),
    BrowserTransferStateModule,
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: UniversalInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppBrowserModule {

}
