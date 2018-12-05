import {Pair} from './Pair';
export type SimplexMiddleware = (pair: Pair, next: () => void) => void;
export interface IDuplexMiddleware {
  onGet: SimplexMiddleware;
  onSet: SimplexMiddleware;
}
