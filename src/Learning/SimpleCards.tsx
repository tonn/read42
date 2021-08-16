import React, { createRef, useState } from 'react';
import { If } from '../Helpers/If';
import { Map } from '../Helpers/Map';
import { Modal } from '../Helpers/Modal';
import { IDictionaryRecord } from "../Store/IDictionaryRecord";
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BEM, Nbsp } from '../Helpers';
import nameof from 'ts-nameof.macro';
import './SimpleCards.scss';
import { LearningService } from './LearningService';

export const SimpleCards: React.FC = () => {
  const [ record, setRecord ] = useState<IDictionaryRecord>();
  const [ showFullCard, setShowFullCard ] = useState(false);

  function know() {
    if (record) {
      LearningService.UpdateRecord(record, 'right');
    }

    nextWord();
  }

  function dont() {
    if (record) {
      LearningService.UpdateRecord(record, 'wrong');
    }

    setShowFullCard(true);
  }

  function nextWord() {
    setRecord(LearningService.GetNextWord());
    setShowFullCard(false);
  }

  if (!record) {
    nextWord();
  }

  return <div className={block()}>
    <div className={elem('Word')}>{record?.BaseWord}</div>

    <If condition={showFullCard}>
      <div className={elem('Transcription')}>{record?.Transcription}</div>
      <Map items={record?.Translations || []} render={(translation, index) => (
        <div>
          {index + 1}.<Nbsp />{translation}
        </div>
      )} />
    </If>

    <div className={elem('Buttons')}>
      <If condition={!showFullCard}>
        <button onClick={know}>Know</button>
        <button onClick={dont}>Don't</button>
      </If>
      <If condition={showFullCard}>
        <button onClick={nextWord}>Next</button>
      </If>
    </div>
  </div>;
}

const { block, elem } = BEM(nameof(SimpleCards));
