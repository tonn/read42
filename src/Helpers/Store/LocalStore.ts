import { once } from 'lodash-decorators';
import { BehaviorSubject, Observable } from 'rxjs';

export class LocalStore<T> {
  private readonly _state: BehaviorSubject<T>;
  private readonly _stateObservable: Observable<T>;

  constructor(readonly keys: Array<keyof T>, initialState: T, private storeName: string = '') {
    initialState = { ...initialState, ...this.loadFromLocalStorage() };

    if (!initialState) {
      throw Error('initialState shall be defined');
    }

    this._state = new BehaviorSubject(initialState);
    this._stateObservable = this._state.asObservable();
  }

  Get() {
    return this._state.value;
  }

  Get$() {
    return this._stateObservable;
  }

  Set(changes: Partial<T>) {
    this._state.next({...this.Get(), ...changes});

    this.saveToLocalStorage(changes);
  }

  Update(action: () => void) {
    action();

    this.Set({});
  }

  private saveToLocalStorage(changes: Partial<T>) {
    for (const prop in changes) {
      localStorage[this.storeName + prop] = JSON.stringify(changes[prop]);
    }
  }

  private loadFromLocalStorage(): Partial<T> {
    const result: Partial<T> = {};

    for (const prop of this.keys) {
      const lsKey = this.storeName + prop;

      if (lsKey in localStorage) {
        result[prop] = JSON.parse(localStorage[lsKey]);
      }
    }

    return result;
  }

  // TODO:
  // Use<TProp extends keyof IUserSettings>() {
  //   return useObservableState(
  //     () => UserSettingsService.Get$().pipe(map(s => s[TProp])), 'system',
  //     value => {
  //       const changes: Partial<IUserSettings> = {};
  //       changes[TProp] = value;

  //       UserSettingsService.Set(changes);
  //     }
  //   );
  // }

}
