import { faCheck, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import React, { useReducer, useRef, useState } from 'react';
import nameof from 'ts-nameof.macro';
import { BEM, JsonEditor, Nbsp } from '../Helpers';
import { If } from '../Helpers/If';
import { Map } from '../Helpers/Map';
import { useStore } from '../Helpers/Store/Store42/useStore';
import { Tabs } from '../Helpers/Tabs';
import { Store } from '../Store';
import { IDictionaryRecord } from '../Store/IDictionaryRecord';
import './DictionaryPage.scss';
import { DictionaryRecordModal } from './DictionaryRecord';
import { TagsSelector, TagsSelectorRef } from './TagsSelector';

interface IDictionaryRecordViewModel {
  Record: IDictionaryRecord;
  IsSeleted: boolean;
  StudyIndicator: number;
}

function PrepareDictionaryRecordViewModels(dict: IDictionaryRecord[]): IDictionaryRecordViewModel[] {
  const maxPoints = _.maxBy(dict, r => r.Learning?.Points || 0)?.Learning?.Points || 1;

  return dict.map(r => ({ Record: r, IsSeleted: false, StudyIndicator: (r.Learning?.Points || 0) / maxPoints }));
}

export const DictionaryPage: React.FC<{}> = (props) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const [ dict ] = useStore(Store, s => PrepareDictionaryRecordViewModels(s.SharedState.Dictionary));

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recordEditModalRef = useRef<DictionaryRecordModal>(null);
  const tagsSelectorRef = useRef<TagsSelectorRef>(null);

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
    let lines = inputRef.current?.value.split('\n');

    if (lines) {
      const sharedState = Store.Get().SharedState;

      const newDict = [...sharedState.Dictionary]

      let tags: string[] = [];

      if (lines[0][0] === '!') {
        const tagsLine = lines[0];
        lines = lines.slice(1);
        tags.push(...tagsLine.split(';'));
      }

      lines.forEach(line => {
        if (!_.isEmpty(line) &&
            !newDict.some(r => r.BaseWord === line)) {
          const [record, transcription, ...translations] = line.split(';').map(_.trim);

          newDict.push({
            BaseWord: record,
            Transcription: transcription,
            Translations: translations,
            Tags: tags
          });
        }

        return !_.isEmpty(line) &&
               !sharedState.Dictionary.some(r => r.BaseWord === line);
      });

      Store.Set({ SharedState: { ...sharedState, Dictionary: newDict } });
    }
  }

  function removeSelected() {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Remove selected items?`)) {
      const sharedState = Store.Get().SharedState;
      const newDict = dict.filter(rvm => !rvm.IsSeleted).map(rvm => rvm.Record);

      Store.Set({ SharedState: { ...sharedState, Dictionary: newDict } });
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

  async function showEditModal(record: IDictionaryRecord) {
    await recordEditModalRef.current?.Show$(record);

    const sharedState = Store.Get().SharedState;
    const newDict = [...sharedState.Dictionary]
    Store.Set({ SharedState: { ...sharedState, ...{ Dictionary: newDict } } });

    forceUpdate();
  }

  async function editTags$() {
    let selected = dict.filter(i => i.IsSeleted);

    if (selected.length === 0) {
      selected = dict;
    }

    const allTags = _.uniq(dict.flatMap(i => i.Record.Tags || []));
    const selectedTags = _.uniq(dict.flatMap(i => i.Record.Tags || []));

    const result = await tagsSelectorRef.current?.Show$(allTags, selectedTags, []);

    if (result) {
      selected.forEach(s => s.Record.Tags = [...s.Record.Tags || [], ...result.add].filter(t => !result.remove.includes(t)));

      forceUpdate();
    }
  }

  function stopPropagation(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className={block()}>
      <textarea ref={inputRef} className={elem('Input')} onKeyPress={onInputKeyPress} />
      <div>
        <button onClick={onAddRecordsButtonPress}><FAIcon icon={faPlus}/> Add records</button>
        <button onClick={removeSelected}><FAIcon icon={faTrash}/> Remove selected</button>
        <button onClick={toggleSelectionAll}><FAIcon icon={faCheck}/> (Un)Select all</button>
        <button onClick={editTags$}>Edit tags</button>
      </div>
      <Tabs className={elem('Tabs')} Tabs={[{
        Title: 'List',
        Render: () =>
          <div className={elem('Records')}>
            <Map items={dict} render={(recordvm, index) =>
              <div className={elem('Record', !recordvm.Record.Translations?.length && 'NoTranslation')} key={recordvm.Record.BaseWord + index}
                onClick={() => showEditModal(recordvm.Record)}
                style={{ '--studyIndicator': recordvm.StudyIndicator } as any}>
                <input className={elem('Selection')} type='checkbox' checked={recordvm.IsSeleted} onChange={() => toggleRecordSelection(recordvm)} onClick={stopPropagation} />
                <span>
                  {index+1}.<Nbsp />{recordvm.Record.BaseWord} <span><If condition={!!recordvm.Record.Transcription}>[{recordvm.Record.Transcription}]</If> {recordvm.Record.Translations![0] || ''}</span>
                </span>
              </div>
            } />
          </div>
      }, {
        Title: 'Json',
        Render: () =>
          <JsonEditor className={elem('Records')} json={dict.map(d => d.Record)} options={{
            mode: 'tree',
            schema: {
              elements: {
                properties: {
                  BaseWord: { type: 'string' },
                  Transcription: { type: 'string'},
                  Translations: { elements: { type: 'string' } }
                }
              }
            }
          }} />
      }, {
        Title: 'Text',
        Render: () => <textarea />
      }]}/>

      <DictionaryRecordModal ref={recordEditModalRef} />
      <TagsSelector ref={tagsSelectorRef} />
    </div>
  );
}

const { block, elem } = BEM(nameof(DictionaryPage));
