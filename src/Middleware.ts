import {Pair} from './Pair';
export type SimplexMiddleware = (pair: Pair, next: Function) => void;
export interface IDuplexMiddleware {
  onGet: SimplexMiddleware;
  onSet: SimplexMiddleware;
}
