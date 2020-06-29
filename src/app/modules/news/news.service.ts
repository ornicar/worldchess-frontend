import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INews } from '@app/broadcast/chess-footer/news/news.model';
import { NewsResourceService } from '@app/broadcast/chess-footer/news/news-resource.service';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable()
export class NewsService {

  constructor(
    private httpClient: HttpClient,
    private newsService: NewsResourceService) {
  }

  loadScripts(): Observable<{ css: string, js: string }> {
    // TODO подумать, можно ли не перезапрашивать стили каждый раз при пргрузке новости
    return this.httpClient.get<{ css: string, js: string }>(`${environment.newsUrl}/posts/media`)
      .pipe(
        tap(s => this.insertScripts(s))
      );
  }

  private insertScripts(scripts: { css: string, js: string }): Observable<void> {
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
            resolve();
          }
        };
      } else {  // Others
        scriptEl.onload = () => {
          resolve();
        };
      }
    }));
  }

  getNewsBySlug(slug: string): Observable<INews> {
    return this.newsService.getBySlug(slug);
  }
}
