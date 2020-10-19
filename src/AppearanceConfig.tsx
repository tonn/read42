import React from 'react';
import { HexColorPicker } from 'react-colorful';

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
    return (<>
        <HexColorPicker color={Appearance.background} onChange={color => { Appearance.background = color; onChanged(); } } />
        <HexColorPicker color={Appearance.color} onChange={color => { Appearance.color = color; onChanged(); } } />
    </>);
}
