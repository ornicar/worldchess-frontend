import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../../account/account-store/account.service';
@Component({
  selector: 'game-main-fide-text',
  templateUrl: './game-main-fide-text.component.html',
  styleUrls: ['./game-main-fide-text.component.scss']
})
export class GameMainFideTextComponent implements OnInit {
  
  constructor(
    public accountService: AccountService
  ) { }
  ngOnInit() {
    
  }
}
