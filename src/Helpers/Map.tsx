import React from 'react';

export function Map<TItem>(props: { items: readonly TItem[], render: (item: TItem, index: number) => React.ReactNode }) {
  return <> { props.items.map((item, index) => props.render(item, index)) } </>;
}