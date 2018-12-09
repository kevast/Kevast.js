import { Pair } from './Pair';
export type SimplexMiddleware = (pair: Pair, next: () => Promise<void>) => Promise<void> | void;
export interface IDuplexMiddleware {
  onGet: SimplexMiddleware;
  onSet: SimplexMiddleware;
}
