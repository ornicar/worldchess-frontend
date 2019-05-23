import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Partnership} from './partnership';

@Injectable()
export class PartnershipService {

  constructor(httpClient: HttpClient) {
  }

  getPartnership(): Partnership[] {
    return [
      {
        date: 'Dec 17 — 11:12 am',
        title: 'Round Four: Aronian Emerged Sole',
        image: 'assets/fake-news.jpg',
        tags: ['Candidates', 'Londonchess', ' Palma2017']
      },
      {
        date: 'Dec 17 — 11:12 am',
        title: 'Round Four: Aronian Emerged Sole',
        image: 'assets/fake-news.jpg',
        tags: ['Candidates', 'Londonchess', ' Palma2017']
      },
      {
        date: 'Dec 17 — 11:12 am',
        title: 'Round Four: Aronian Emerged Sole',
        image: 'assets/fake-news.jpg',
        tags: ['Candidates', 'Londonchess', ' Palma2017']
      },
      {
        date: 'Dec 17 — 11:12 am',
        title: 'Round Four: Aronian Emerged Sole',
        image: 'assets/fake-news.jpg',
        tags: ['Candidates', 'Londonchess', ' Palma2017']
      },
      {
        date: 'Dec 17 — 11:12 am',
        title: 'Round Four: Aronian Emerged Sole',
        image: 'assets/fake-news.jpg',
        tags: ['Candidates', 'Londonchess', ' Palma2017']
      },
      {
        date: 'Dec 17 — 11:12 am',
        title: 'Round Four: Aronian Emerged Sole',
        image: 'assets/fake-news.jpg',
        tags: ['Candidates', 'Londonchess', ' Palma2017']
      },
    ];
  }
}
