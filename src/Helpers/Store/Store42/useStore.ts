import { useEffect, useState } from 'react';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { LocalStore } from '../LocalStore';

export function useStore<TState, TValue>(store: LocalStore<TState>, get: (state: TState) => TValue, set?: (value: TValue) => Partial<TState>): [TValue, ((value: TValue) => void) | undefined] {
  const [state, setState] = useState<TValue>(() => get(store.Get()));

  useEffect(() => {
    const subscription = store.Get$().pipe(map(get), distinctUntilChanged()).subscribe(setState);

    return () => subscription.unsubscribe();
  }, [store]);

  const setStoreState = set && ((value: TValue) => {
    store.Set(set(value));
  });

  return [state, setStoreState];
}
