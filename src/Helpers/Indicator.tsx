import React from 'react';
import { timeout$ } from './timeout$';
import IndicatorSvg from '../Resources/Indicator.svg';
import nameof from 'ts-nameof.macro';
import { BEM } from './BEM';
import './Indicator.scss';

let _mainIndicator!: Indicator;
export function GetIndicator()  {
  return _mainIndicator;
}

export interface IIndicatorProps {
  Main?: boolean;
}

export class Indicator extends React.Component<IIndicatorProps, { isVisible: boolean }> {
  private _wrapCounter = 0;

  constructor(props: IIndicatorProps) {
    super(props);
    this.state = { isVisible: false };

    if (props.Main) {
      _mainIndicator = this;
    }
  }

  async Wrap$<T>(action: () => Promise<T>, minDuration = 500): Promise<T> {
    try {
      // const minDuration$ = timeout$(minDuration);

      if (this._wrapCounter++ === 0) {
        this.setState({ isVisible: true });
      }

      await timeout$(minDuration / 2); // Wait dom render properly

      const result = await action();

      await timeout$(minDuration / 2);

      return result;
    } finally {
      if (--this._wrapCounter === 0) {
        this.setState({ isVisible: false });
      }
    }
  }

  render() {
    const { isVisible } = this.state;

    return !isVisible ? <></> : <div className={block()}><div className={elem('IconContainer')}><img src={IndicatorSvg} alt=''/></div></div>;
  }
}

const { block, elem } = BEM(nameof(Indicator));
