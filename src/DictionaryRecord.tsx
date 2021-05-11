import React, { createRef } from 'react';
import './DictionaryRecord.scss';
import { JsonEditor } from './Helpers';
import { Modal } from './Helpers/Modal';
import { IDictionaryRecord } from './State';

export const DictionaryRecord: React.FC<{ Record: IDictionaryRecord }> = ({ Record }) => {
  return <div>
    <JsonEditor json={Record} />
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
