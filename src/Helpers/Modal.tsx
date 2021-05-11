import React from 'react';
import { default as ReactModal } from 'react-modal';

type ModalResult = 'ok' | 'cancel';
type ResultCallback = (result: ModalResult) => void;

interface IModalProps {
  render: (closeCallback: ResultCallback) => React.ReactNode
}

interface IModalState {
  closeCallback?: ResultCallback;
}


export class Modal extends React.Component<IModalProps, IModalState, {}> {
  constructor(props: IModalProps) {
    super(props);

    this.state = {};
  }

  async Show$(): Promise<ModalResult> {
    const result$ = new Promise<ModalResult>(resolve => this.setState({ closeCallback: resolve }));

    try {
      const result = await result$;

      this.setState({ closeCallback: undefined });

      return result;
    } finally {
      this.setState({ closeCallback: undefined });
    }
  }

  render() {
    const { closeCallback } = this.state;
    const { render } = this.props;

    return <ReactModal isOpen={!!closeCallback}>{closeCallback ? render(closeCallback) : null}</ReactModal>
  }
}
