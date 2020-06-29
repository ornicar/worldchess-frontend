import {IPlayerRating} from '../../app-common/services/player-rating.model';

export interface IPlayerWithCountry extends IPlayerRating {
  country_name: string;
}

export class SearchPlayerHelper {

  public static filterPlayers([players, searchQuery = '']: [IPlayerWithCountry[], string]): IPlayerWithCountry[] {
    if (!players || players.length === 0 || searchQuery === '') {
      return players;
    }
    const searchReg = new RegExp(searchQuery, 'gi');
    return players.filter((player) => searchReg.test(player.full_name));
  }

  public static sortPlayers([players, sortField = '']: [IPlayerWithCountry[], string]): IPlayerWithCountry[] {
    let sortDirect = 1;
    let field = sortField;
    if (sortField[0] === '-') {
      sortDirect = -1;
      field = sortField.slice(1, sortField.length);
    }

    return players.sort((a, b) => +(a[field] > b[field]) * sortDirect || -(a[field] < b[field]) * sortDirect);
  }
}
