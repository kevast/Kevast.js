import {NullablePair , Pair} from './Pair';
export type GetMiddleware = (pair: NullablePair, next: () => void) => void;
export type SetMiddleware = (pair: Pair, next: () => void) => void;
export interface IMiddleware {
  onGet: GetMiddleware;
  onSet: SetMiddleware;
}
