import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';


@Injectable()
export class AuthRouteInterceptor implements CanActivate {
constructor(private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const destination = next.queryParamMap.get('destination');
    if (destination) {
      return true;
    } else {
      this.router.navigate([state.url], { queryParams: { destination: encodeURI(this.router.url) } });
      return false;
    }
  }
}
