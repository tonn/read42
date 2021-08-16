import { Subscription } from 'rxjs';

export interface IDisposable {
  Dispose(): void | Promise<void>;
}

function IsIDisposable(a: any): a is IDisposable {
  return !!a.Dispose;
}

export async function using<T>(source: Subscription | IDisposable, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } finally {
    if (IsIDisposable(source)) {
      await source.Dispose();
    } else {
      source.unsubscribe();
    }
  }
}
