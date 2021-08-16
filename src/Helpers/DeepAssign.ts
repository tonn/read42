export function DeepAssign<T extends Object>(target: any, ...sources: Partial<T>[]): T {
  for (const source of sources) {
    for (const propName in source) {
      if (source.hasOwnProperty && source.hasOwnProperty(propName)) {
        const propValue = source[propName] as any;

        if (typeof (propValue) === 'object') {
          target[propName] = DeepAssign({}, target[propName] || {}, propValue || {});
        } else {
          target[propName] = propValue;
        }
      }
    }
  }

  return target;
}
