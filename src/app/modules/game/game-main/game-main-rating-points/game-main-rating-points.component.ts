import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../../account/account-store/account.service';

@Component({
  selector: 'game-main-rating-points',
  templateUrl: './game-main-rating-points.component.html',
  styleUrls: ['./game-main-rating-points.component.scss']
})
export class GameMainRatingPointsComponent implements OnInit {

  constructor(
    public accountService: AccountService
  ) { }

  ngOnInit() {
    
  }
}
