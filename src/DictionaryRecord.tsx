import React, { createRef, useEffect, useReducer, useState } from 'react';
import './DictionaryRecord.scss';
import { JsonEditor } from './Helpers';
import { Map } from './Helpers/Map';
import { Modal } from './Helpers/Modal';
import { MerriamWebster } from './Integrations';
import { IDictionaryRecord } from './State';

export const DictionaryRecord: React.FC<{ Record: IDictionaryRecord }> = ({ Record }) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [ integrationShards ] = useState<string[]>([]);

  useEffect(() => {
    MerriamWebster.GetWordInfo(Record.BaseWord).then(shards => {
      integrationShards.push(...shards);

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

  return <div>
    <JsonEditor json={Record} />

    <Map items={integrationShards} render={item =>
      <div>
        <button title='Use as transcription' onClick={() => updateTranscription(item)}>1</button>
        <button title='Add translation' onClick={() => addTranslation(item)}>2</button>
        {item}
      </div>
    } />
  </div>;
}

export class DictionaryRecordModal extends React.Component<{}, { record: IDictionaryRecord }, {}> {
  private modalRef = createRef<Modal>();

  Show$(record: IDictionaryRecord) {
    this.setState({ record });

    return this.modalRef.current?.Show$();
  }

  render() {
    return (
      <Modal ref={this.modalRef} render={close =>
        <>
          <DictionaryRecord Record={this.state.record} />
          <button onClick={() => close('ok')}>Ok</button>
        </>
      } />
    );
  }
}
