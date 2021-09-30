import React, { useReducer } from 'react';
import { SliderPicker } from 'react-color';
import { IAppearance } from '.';
import './AppearanceConfig.scss';

export const AppearanceConfig: React.FC<{ Appearance: IAppearance, onChanged: () => void }> = ({ Appearance, onChanged }) => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  function update(changes: Partial<IAppearance>) {
    Object.assign(Appearance, changes);
    forceUpdate();
    onChanged();
  }

  return (<>
    Background color:
    <SliderPicker color={Appearance.Background} onChange={color => update({ Background: color.hex })}/>
    <br/>
    Font color:
    <SliderPicker color={Appearance.Color} onChange={color => update({ Color: color.hex })}/>
    <br/>
    Font size:
    <input type='number' value={Appearance.FontSize} onChange={e => update({ FontSize: parseFloat(e.target.value) })} />
    <br/>
    Font:
    <input value={Appearance.FontFamily} onChange={e => update({ FontFamily: e.target.value })} />
    <br/>
    Line height:
    <input type='number' value={Appearance.LineHeight} onChange={e => update({ LineHeight: parseFloat(e.target.value) })} />
    <br/>
    Margin Left:
    <input type='number' value={Appearance.PaddingLeft} onChange={e => update({ PaddingLeft: parseFloat(e.target.value) })} />
    <br/>
    Margin Right:
    <input type='number' value={Appearance.PaddingRight} onChange={e => update({ PaddingRight: parseFloat(e.target.value) })} />
  </>);
}
