import React, { useReducer } from 'react';
import { SliderPicker } from 'react-color';
import './AppearanceConfig.scss';

export const DefaultAppearance: IAppearance = {
  color: '#222',
  background: '#CCA',
  fontFamily: 'arial',
  fontSize: 5,
  lineHeight: 1.5,
  padding: [ 5, 5, 5, 5 ],
};

export interface IAppearance {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  background: string;
  padding: number[];
  color: string;
}

export const AppearanceConfig: React.FC<{ Appearance: IAppearance, onChanged: () => void }> = ({ Appearance, onChanged }) => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  return (<>
    Background color:
    <SliderPicker color={Appearance.background}  onChange={color => { Appearance.background = color.hex; onChanged(); forceUpdate(); } }/>
    <br/>
    Font color:
    <SliderPicker color={Appearance.color} onChange={color => { Appearance.color = color.hex; onChanged(); forceUpdate(); } }/>
  </>);
}
