import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { createRef } from 'react';
import nameof from 'ts-nameof.macro';
import { BEM } from './BEM';
import { Modal } from './Modal';
import './ModalWithCloseButton.scss';

export class ModalWithCloseButton extends React.Component<{ ContentFullSize?: boolean }, {}, {}> {
  private modalRef = createRef<Modal>();

  Show$() {
    return this.modalRef.current?.Show$();
  }

  render() {
    return (
      <Modal className={block()} ref={this.modalRef} render={close =>
        <div className={elem('Content', this.props.ContentFullSize && 'FullSize')}>
          {this.props.children}
          <FontAwesomeIcon className={elem('CloseIcon')} icon={faTimes} onClick={() => close('ok')} />
        </div>
      } />
    );
  }
}

const { block, elem } = BEM(nameof(ModalWithCloseButton));
