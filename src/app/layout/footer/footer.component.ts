import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  @Input() sponsorsVisible = true;

  email = '';

  isSent = false;
  isError = false;
  errorMsg = '';

  constructor(router: Router) {
    router.events
      .subscribe((url) => {
        if (router.url.indexOf('/partnership') === -1
          || router.url.indexOf('/sign-in') === -1
          || router.url.indexOf('/sign-up') === -1) {
          this.sponsorsVisible = true;
        } else {
          this.sponsorsVisible = false;
        }
      });
  }

  ngOnInit() {
  }

  subscription() {
    this.errorMsg = '';
    this.isError = false;

    const success = () => { this.isSent = true; };

    const error = (err: any) => {
      if (err && err.error && err.error.status === 400) {
        this.errorMsg = err.error.message;
        // workaround: Remove technical info:
        // Ex.: External system error: 400 Please provide a valid email address. ->  Please provide a valid email address.
        const index = this.errorMsg.indexOf(' 400 ');
        if (index !== -1) {
          this.errorMsg = this.errorMsg.substring(index + 5);
        }
      }
      this.isError = true;
    };

    // this.userService.subscribeNonAuth(this.email)
    //   .subscribe(success, error);
  }
}
