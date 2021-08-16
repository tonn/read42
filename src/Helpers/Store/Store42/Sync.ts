import { ReplaySubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { IDisposable } from '../../IDisposable';
import { LocalStore } from '../LocalStore';
import { Store42Api } from './Api';
import { RemoteStoreResponse } from './RemoteStoreResponse';

export interface IStore42SharedState<T> {
  SharedState: T,
  SharedStateTimestamp?: number
}

export class Store42Sync<T> implements IDisposable {
  private readonly disposed$ = new ReplaySubject(1);

  constructor(
    readonly api: Store42Api,
    readonly store: LocalStore<IStore42SharedState<T>>,
    readonly merge: (local: T, remote: T) => T,
    readonly compare?: (a: T, b: T) => boolean,
  ) {
    store.Get$().pipe(
      takeUntil(this.disposed$),
      map(state => state.SharedState),
      distinctUntilChanged(compare),
      debounceTime(60 * 1000)
    )
    .subscribe(sharedState => {
      console.log('Do sync!');
      // this.SaveSharedState(); // TODO:
    });
  }

  Dispose(): void | Promise<void> {
    this.disposed$.next();
  }

  async RestoreSharedState() {
    const response = await this.api.Get$<RemoteStoreResponse<T>>(`data`);

    if (response && response.data.UnixTimestamp !== this.store.Get().SharedStateTimestamp) {
      this.store.Set({ SharedState: this.merge(this.store.Get().SharedState, response.data.Data),
                       SharedStateTimestamp: response.data.UnixTimestamp });
    }
  }

  async SaveSharedState() {
    const { SharedState: state, SharedStateTimestamp: timestamp } = this.store.Get();

    const response = await this.api.Post$<RemoteStoreResponse<T>>(`data`, state, { unixTimestamp: timestamp });

    if (response && response.data.DataWasChanged) {
      await this.RestoreSharedState();
      await this.SaveSharedState(); // TODO: CHECK: reccursion
    }
  }
}

