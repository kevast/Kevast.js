import { Pair } from './Pair';
export type GetMiddleware = (pair: Pair, next: () => void) => void;
export type SetMiddleware = (pair: Pair, next: () => Promise<void>) => Promise<void>;
export interface IMiddleware {
  onGet: GetMiddleware;
  onSet: SetMiddleware;
}
