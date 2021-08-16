import { IAuthState } from '../Helpers/Store/Store42/Api';
import { IStore42SharedState } from '../Helpers/Store/Store42/Sync';
import { DefaultSharedState, IAppSharedState } from './IAppSharedState';
import { ILocalSource } from './ILocalSource';

export interface IAppLocalState extends IStore42SharedState<IAppSharedState>, IAuthState {
  LastSource?: ILocalSource;
}

export const DefaultLocalState: IAppLocalState = {
  SharedState: DefaultSharedState
}
