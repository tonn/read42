import React, { useRef } from 'react';
import nameof from 'ts-nameof.macro';
import { BEM } from './Helpers';
import { Store } from './Store';

export const DictionaryPage: React.FC<{}> = (props) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const dict = Store.Get().SharedState.Dictionary;

  function onKeyPress(e: React.KeyboardEvent) {
    if (e.key === '13' && inputRef.current) {
      inputRef.current.value.split('\n').forEach(word => {
        dict.push({
          BaseWord: word
        });
      });
    }
  }

  return (<div className={block()}>
    <textarea ref={inputRef} onKeyPress={onKeyPress} />

    { dict.map(record => <div>{record.BaseWord}</div>) }
  </div>);
}

const { block, /*elem*/ } = BEM(nameof(DictionaryPage));
