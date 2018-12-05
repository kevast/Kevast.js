type Pair = [string, string];
type Interceptor = (pair: Pair) => void;

export interface IMiddleware {
  onGet: Interceptor;
  onSet: Interceptor;
}
