import _ from 'lodash';
import React, { useState } from 'react';
import nameof from 'ts-nameof.macro';
import { BEM, Nbsp } from '../Helpers';
import { IfDiv } from '../Helpers/If';
import { Map } from '../Helpers/Map';
import { Store } from '../Store';
import { IDictionaryRecord } from "../Store/IDictionaryRecord";
import { DictionaryRecordEditButton } from '../Vocabular';
import './ChooseTranslation.scss';
import { LearningService } from './LearningService';

interface ChooseOption { text: string, right?: boolean, chosen?: boolean }

export const ChooseTranslation: React.FC = () => {
  const [ record, setRecord ] = useState<IDictionaryRecord>();
  const [ options, setOptions ] = useState<ChooseOption[]>([]);
  const [ right, setRight ] = useState<'unknown' | 'yes' | 'no'>('unknown');
  const [ optionButtonsDisabled, setOptionButtonsDisabled ] = useState(false);

  function nextWord() {
    let dict = Store.Get().SharedState.Dictionary.filter(r => r.Translations?.some(() => true));

    const record = LearningService.GetNextWord();

    const options: ChooseOption[] =
      [{ text: _.sample(record.Translations) || '', right: true },
       ..._(dict).without(record).flatMap(r => r.Translations || []).sampleSize(4).map(t => ({ text: t })).value()];

    setRecord(record);
    setOptions([..._.shuffle(options), { text: `Don't know` }]);
    setRight('unknown');

    setTimeout(() => setOptionButtonsDisabled(false), 1000); // prevent accidental tap after word switch
  }

  if (!record) {
    nextWord();
  }

  function choose(option: ChooseOption) {
    option.chosen = true;
    setRight(option.right ? 'yes' : 'no');
    setOptionButtonsDisabled(true);

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
                disabled={optionButtonsDisabled}
                onClick={() => choose(option)}>
          {index + 1}.<Nbsp />{option.text}
        </button>
      )}/>

      <IfDiv className={elem('NextWordOverlay')} condition={right !== 'unknown'} onClick={nextWord}>
        <div className={elem('NextWordOverlayTitle')}>Press to go next word</div>
      </IfDiv>
    </div>

    {record ? <DictionaryRecordEditButton className={elem('EditButton')} Record={record} /> : null}
  </div>;
}

const { block, elem } = BEM(nameof(ChooseTranslation));
