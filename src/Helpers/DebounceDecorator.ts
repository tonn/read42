export function Debounce(ms: number): MethodDecorator {
  return function(target: Object, propKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> {
    descriptor.value = DebounceFn(descriptor.value, ms )

    return descriptor;
  }
}

export function DebounceFn<TResult>(originalFn: (...args: any[]) => void, ms: number) {
  let timeout: number | undefined;

  return function(...args: any[]) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      originalFn.apply(args);
    }, ms) as any as number;
  };
}
