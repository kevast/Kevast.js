import {NullablePair , Pair} from './Pair';
export type GetMiddleware = (pair: NullablePair, next: Function) => void;
export type SetMiddleware = (pair: Pair, next: Function) => void;
export interface IMiddleware {
  onGet: GetMiddleware;
  onSet: SetMiddleware;
}
