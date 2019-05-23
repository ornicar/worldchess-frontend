import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {environment} from '../../environments/environment';
import {INews} from '../broadcast/chess-footer/news/news.model';
import {switchMap, tap} from 'rxjs/operators';
import {fromPromise} from 'rxjs/internal-compatibility';
import {INewsFilters, NewsResourceService} from '../broadcast/chess-footer/news/news-resource.service';

export interface ISetkaEditorPublic {
  start(): void;
  stop(): void;
}

@Injectable()
export class NewsService {
  private scriptLoader: any;

  constructor(
    private httpClient: HttpClient,
    private newsService: NewsResourceService) {
  }

  /**
   * @deprecated the "get setkaApi" should not do any side effects. Use the loadSetkaApi instead of it.
   */
  get setkaApi(): Observable<any> {
    return of(window['SetkaEditorPublic'])
      .pipe(
        switchMap(setkaAPI => {
          if (!setkaAPI) {
            return this.scriptLoader || this.loadScripts();
          }
          return of(setkaAPI);
        }),
      );
  }

  public loadSetkaApi(): Observable<ISetkaEditorPublic> {
    return this.setkaApi;
  }

  private loadScripts() {
    return this.scriptLoader = this.httpClient.get<{ css: string, js: string }>(`${environment.newsUrl}/posts/media`)
      .pipe(
        switchMap(s => this.insertScripts(s)),
        tap(() => this.scriptLoader = null)
      );
  }

  private insertScripts(scripts: { css: string, js: string }): Observable<any> {
    let scriptEl = document.createElement('script') as any;
    scriptEl.type = 'text/javascript';
    scriptEl.src = scripts.js;
    document.getElementsByTagName('head')[0].appendChild(scriptEl);

    scriptEl = document.createElement('link') as any;
    scriptEl.setAttribute('href', scripts.css);
    scriptEl.setAttribute('rel', 'stylesheet');
    document.getElementsByTagName('head')[0].appendChild(scriptEl);

    return fromPromise(new Promise((resolve) => {
      if (scriptEl.readyState) {  // IE
        scriptEl.onreadystatechange = () => {
          if (scriptEl.readyState === 'loaded' || scriptEl.readyState === 'complete') {
            scriptEl.onreadystatechange = null;
            resolve(window['SetkaEditorPublic']);
          }
        };
      } else {  // Others
        scriptEl.onload = () => {
          resolve(window['SetkaEditorPublic']);
        };
      }
    }));
  }

  getAllNews(filters: INewsFilters = {}): Observable<INews[]> {
    return this.newsService.getAll(filters);
  }

  loadNews(filters: INewsFilters = {}): Observable<INews[]> {
    return this.newsService.loadNews(filters);
  }

  getNewsById(id: number): Observable<INews> {
    return this.newsService.get(id);
  }
}
