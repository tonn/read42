import React, { useRef } from 'react';
import nameof from 'ts-nameof.macro';
import { BEM } from '../Helpers';
import { ModalWithCloseButton } from '../Helpers/ModalWithCloseButton';
import { ChooseTranslation } from './ChooseTranslation';
import { SimpleCards } from './SimpleCards';

export const LearningPage: React.FC = () => {
  const simpleCards = useRef<ModalWithCloseButton>(null);
  const chooseTranslation = useRef<ModalWithCloseButton>(null);

  return <div className={block()}>
    <button className={elem('Button', 'SimpleCards')} onClick={() => simpleCards.current?.Show$()}>Simple cards</button>
    <button className={elem('Button', 'SimpleCards')} onClick={() => chooseTranslation.current?.Show$()}>Choose translation</button>

    <ModalWithCloseButton ref={simpleCards} ContentFullSize><SimpleCards /></ModalWithCloseButton>
    <ModalWithCloseButton ref={chooseTranslation} ContentFullSize><ChooseTranslation /></ModalWithCloseButton>
  </div>;
}

const { block, elem } = BEM(nameof(LearningPage));
