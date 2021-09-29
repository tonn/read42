import React, { createRef, useEffect, useReducer, useRef, useState } from 'react';
import './DictionaryRecord.scss';
import { BEM, JsonEditor } from '../Helpers';
import { If } from '../Helpers/If';
import { Map } from '../Helpers/Map';
import { Modal } from '../Helpers/Modal';
import { LingvoOnline, MerriamWebster } from '../Integrations';
import { IDictionaryRecord } from "../Store/IDictionaryRecord";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import nameof from 'ts-nameof.macro';
import './DictionaryRecord.scss'

export const DictionaryRecord: React.FC<{ Record: IDictionaryRecord }> = ({ Record }) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [ integrationShards ] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([LingvoOnline.GetWordInfo(Record.BaseWord).catch(() => {}), MerriamWebster.GetWordInfo(Record.BaseWord).catch(() => {})])
    .then(([lingvo, merriam]) => {
      integrationShards.push(...lingvo || [], ...merriam || []);

      forceUpdate();
    });
  }, []);

  function updateTranscription(transcription: string) {
    Record.Transcription = transcription;

    forceUpdate();
  }

  function addTranslation(translation: string) {
    Record.Translations = [...Record.Translations || [], translation];

    forceUpdate();
  }

  function updateRecord(changes: IDictionaryRecord) {
    Object.assign(Record, changes);
  }

  return <div className={block()}>
    <JsonEditor json={Record} onChange={updateRecord} />

    <Map items={integrationShards} render={(item, index) =>
      <div key={item + index}>
        <button title='Use as transcription' onClick={() => updateTranscription(item)}>1</button>
        <button title='Add translation' onClick={() => addTranslation(item)}>2</button>
        <If condition={item.startsWith('<b>')}>
          <span dangerouslySetInnerHTML={{ __html: item }}/>
        </If>
        <If condition={!item.startsWith('<b>')}>
          {item}
        </If>
      </div>
    } />
  </div>;
}

const { block, elem } = BEM(nameof(DictionaryRecord));

export class DictionaryRecordModal extends React.Component<{}, { record: IDictionaryRecord }, {}> {
  private modalRef = createRef<Modal>();

  Show$(record: IDictionaryRecord) {
    this.setState({ record });

    return this.modalRef.current?.Show$();
  }

  render() {
    return (
      <Modal ref={this.modalRef} render={close =>
        <div className={blockModal()}>
          <DictionaryRecord Record={this.state.record} />
          <FontAwesomeIcon className={elemModal('CloseIcon')} icon={faTimes} onClick={() => close('ok')} />
        </div>
      } />
    );
  }
}

const { block: blockModal, elem: elemModal } = BEM(nameof(DictionaryRecordModal));

export const DictionaryRecordEditButton: React.FC<{ Record: IDictionaryRecord, className?: string }> = ({ Record, className }) => {
  const ref = useRef<DictionaryRecordModal>(null);

  return <button className={className} onClick={async () => await ref.current?.Show$(Record)}>
    Edit
    <DictionaryRecordModal ref={ref} />
  </button>;
}
