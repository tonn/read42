import React, { useReducer, useRef, useState } from 'react';
import nameof from 'ts-nameof.macro';
import { BEM, JsonEditor, Nbsp } from './Helpers';
import { Store } from './Store';
import { faTrash, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import './DictionaryPage.scss';
import _ from 'lodash';
import { IDictionaryRecord } from './State';
import { Modal } from './Helpers/Modal';
import { DictionaryRecordModal } from './DictionaryRecord';

interface IDictionaryRecordViewModel {
  Record: IDictionaryRecord;
  IsSeleted: boolean;
}

function PrepareDictionaryRecordViewModels(dict: IDictionaryRecord[]): IDictionaryRecordViewModel[] {
  return dict.map(r => ({ Record: r, IsSeleted: false }));
}

export const DictionaryPage: React.FC<{}> = (props) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [dict, setDict] = useState(PrepareDictionaryRecordViewModels(Store.Get().SharedState.Dictionary));
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recordEditModalRef = useRef<DictionaryRecordModal>(null);

  function onInputKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && e.shiftKey && inputRef.current) {
      addRecords();
      inputRef.current.value = '';
      inputRef.current.focus();
      // inputRef.current.setSelectionRange(0, 0);
      // inputRef.current.selectionStart = 0;
      // inputRef.current.selectionEnd = 0;
    }
  }

  function onAddRecordsButtonPress() {
    if (inputRef.current) {
      addRecords();
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }

  function addRecords() {
    const lines = inputRef.current?.value.split('\n');

    if (lines) {
      const sharedState = Store.Get().SharedState;

      const newDict = [...sharedState.Dictionary]

      lines.forEach(line => {
        if (!_.isEmpty(line) &&
            !newDict.some(r => r.BaseWord === line)) {
          const [record, transcription, ...translations] = line.split(';').map(_.trim);

          newDict.push({
            BaseWord: record,
            Transcription: transcription,
            Translations: translations
          });
        }

        return !_.isEmpty(line) &&
               !sharedState.Dictionary.some(r => r.BaseWord === line);
      });

      Store.Set({ SharedState: { ...sharedState, ...{ Dictionary: newDict } } });

      setDict(PrepareDictionaryRecordViewModels(Store.Get().SharedState.Dictionary));
    }
  }

  function removeSelected() {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Remove selected items?`)) {
      const sharedState = Store.Get().SharedState;
      const newDict = dict.filter(rvm => !rvm.IsSeleted).map(rvm => rvm.Record);

      Store.Set({ SharedState: { ...sharedState, ...{ Dictionary: newDict } } });

      setDict(PrepareDictionaryRecordViewModels(Store.Get().SharedState.Dictionary));
    }
  }

  function toggleRecordSelection(recordvm: IDictionaryRecordViewModel) {
    recordvm.IsSeleted = !recordvm.IsSeleted;
    forceUpdate();
  }

  function toggleSelectionAll() {
    if (dict.some(rvm => rvm.IsSeleted)) {
      dict.forEach(rvm => rvm.IsSeleted = false);
    } else {
      dict.forEach(rvm => rvm.IsSeleted = true);
    }

    forceUpdate();
  }

  return (
    <div className={block()}>
      <textarea ref={inputRef} className={elem('Input')} onKeyPress={onInputKeyPress} />
      <div>
        <button onClick={onAddRecordsButtonPress}><FAIcon icon={faPlus}/> Add records</button>
        <button onClick={removeSelected}><FAIcon icon={faTrash}/> Remove selected</button>
        <button onClick={toggleSelectionAll}><FAIcon icon={faCheck}/> (Un)Select all</button>
      </div>
      <div className={elem('Records')}>
        { dict.map((recordvm, index) =>
          <div key={recordvm.Record.BaseWord} className={elem('Record')} onClick={() => recordEditModalRef.current?.Show$(recordvm.Record)}>
            <input type='checkbox' checked={recordvm.IsSeleted} onChange={() => toggleRecordSelection(recordvm)} />
            <span>
              {index+1}.<Nbsp />{recordvm.Record.BaseWord}
            </span>
          </div>) }
      </div>

      <DictionaryRecordModal ref={recordEditModalRef} />
    </div>
  );
}

const { block, elem } = BEM(nameof(DictionaryPage));
