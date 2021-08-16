import { DefaultAppearance, IAppearanceProfile } from './Appearance';
import { IDictionaryRecord } from './IDictionaryRecord';
import { ISource } from './ISource';

export interface IAppSharedState {
  Sources: ISource[];
  Profiles: IAppearanceProfile[];
  Dictionary: IDictionaryRecord[];
}

export const DefaultSharedState: IAppSharedState = {
  Sources: [],
  Profiles: [{
    Name: '',
    Appearance: DefaultAppearance,
    Mode: 'day'
  }],
  Dictionary: []
};
