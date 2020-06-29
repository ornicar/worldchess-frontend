import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {IPaginationResponse} from "@app/modules/main/model/common";
import {ITournament, ITournamentRequest} from "@app/modules/main/model/tournament";
import {environment} from "../../../../environments/environment";
import {catchError} from "rxjs/operators";

@Injectable()
export class OfflineTournamentService {

  constructor(private http: HttpClient) {
  }


  public findTournaments(params?:ITournamentRequest):Observable<IPaginationResponse<ITournament>>{
    const _notEmptyParam = params || {};
    const _params = {..._notEmptyParam, limit: _notEmptyParam.limit || 100}
     const preparedRequest: {[param: string]: string | string[]}={}
     Object.keys(_params).forEach(key=>{
       const val = _params[key];
       if (typeof val==='number'){
         preparedRequest[key] = `${val}`
         return;
       }
       if (typeof val==='string'){
         preparedRequest[key] = val
         return;
       }
     })
    return this.http.get<IPaginationResponse<ITournament>>(
      `${environment.endpoint}/tournaments`,
      {params: preparedRequest}
      ).pipe(
        catchError(
          error=>{
            return of({count:0,results:[]} as IPaginationResponse<ITournament>)
          }
        )
    );
  }

}
