import React, { createRef, useState } from 'react';
import { If } from '../Helpers/If';
import { Map } from '../Helpers/Map';
import { Modal } from '../Helpers/Modal';
import { IDictionaryRecord } from "../Store/IDictionaryRecord";
import { Store } from '../Store';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BEM, Nbsp } from '../Helpers';
import nameof from 'ts-nameof.macro';
import './ChooseTranslation.scss';
import _ from 'lodash';
import { LearningService } from './LearningService';
import { DictionaryRecordEditButton } from '../Vocabular';

interface ChooseOption { text: string, right?: boolean, chosen?: boolean }

export const ChooseTranslation: React.FC = () => {
  const [ record, setRecord ] = useState<IDictionaryRecord>();
  const [ options, setOptions ] = useState<ChooseOption[]>([]);
  const [ right, setRight ] = useState<'unknown' | 'yes' | 'no'>('unknown');

  function nextWord() {
    let dict = Store.Get().SharedState.Dictionary.filter(r => r.Translations?.some(() => true));

    const record = LearningService.GetNextWord();

    const options: ChooseOption[] =
      [{ text: _.sample(record.Translations) || '', right: true },
       ..._(dict).without(record).flatMap(r => r.Translations || []).sampleSize(4).map(t => ({ text: t })).value()];

    setRecord(record);
    setOptions([..._.shuffle(options), { text: `Don't know` }]);
    setRight('unknown');
  }

  if (!record) {
    nextWord();
  }

  function choose(option: ChooseOption) {
    option.chosen = true;
    setRight(option.right ? 'yes' : 'no');

    if (record) {
      LearningService.UpdateRecord(record, option.right ? 'right' : 'wrong')
    }
  }

  return <div className={block()}>
    <div className={elem('Word')}>{record?.BaseWord}</div>

    <div className={elem('Buttons')}>
      <Map items={options} render={(option, index) => (
        <button className={elem('OptionButton', right !== 'unknown' && option.right && 'Right',
                                                right !== 'unknown' && !option.right && option.chosen && 'Wrong',
                                                option.chosen && 'Chosen')}
                disabled={right !== 'unknown'}
                onClick={() => choose(option)}>
          {index + 1}.<Nbsp />{option.text}
        </button>
      )}/>

      <If condition={right !== 'unknown'}>
        <button className={elem('OptionButton')} onClick={nextWord}>Next</button>
      </If>
    </div>

    {record ? <DictionaryRecordEditButton Record={record} /> : null}
  </div>;
}

const { block, elem } = BEM(nameof(ChooseTranslation));
