import React from 'react';

export function Map<TItem>(props: { items: readonly TItem[] | undefined, render: (item: TItem, index: number) => React.ReactNode }) {
  return props.items ? <> { props.items.map((item, index) => props.render(item, index)) } </> : null;
}
