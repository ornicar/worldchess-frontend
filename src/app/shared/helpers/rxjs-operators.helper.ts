import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const truthy = () => <T>(source: Observable<T>) =>
  source.pipe(filter((value) => !!value));
