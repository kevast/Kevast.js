import { Pair } from './Pair';
export type SimplexMiddleware = (pair: Pair) => void;
export interface DuplexMiddleware {
  onGet: SimplexMiddleware;
  onSet: SimplexMiddleware;
}
