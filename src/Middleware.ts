import { Pair } from './Pair';
export type SimplexMiddleware = (pair: Pair) => void;
export interface DuplexMiddleware {
  afterGet: SimplexMiddleware;
  beforeSet: SimplexMiddleware;
}
