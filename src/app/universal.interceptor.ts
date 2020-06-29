import { Inject, Injectable, Optional, PLATFORM_ID } from "@angular/core";
import { HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { REQUEST } from "@nguniversal/express-engine/tokens";
import { makeStateKey, TransferState } from "@angular/platform-browser";
import { of } from "rxjs";
import { tap } from "rxjs/operators";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {

  constructor(
    @Optional() @Inject(REQUEST) protected request: any,
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let serverReq: HttpRequest<any> = req;
    const stateKey = makeStateKey<any>(req.urlWithParams);
    if (isPlatformBrowser(this.platformId) && this.transferState.hasKey(stateKey)) {
      const response = this.transferState.get(stateKey, null);
      this.transferState.remove(stateKey);
      return of(new HttpResponse(response));
    }
    if (isPlatformServer(this.platformId) && this.request) {
      serverReq = req.clone({ url: req.url.replace('/api', 'http://localhost:3333/api') });
    }

    return next.handle(serverReq).pipe(
      tap(res => {
        if (isPlatformServer(this.platformId) && res instanceof HttpResponse) {
          this.transferState.set(stateKey, res);
        }
      }
    ));
  }
}
