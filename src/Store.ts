import Axios from 'axios';
import { DefaultAppearance, IAppearance } from './AppearanceConfig';

const Server = 'https://store42.azurewebsites.net';
const LS_LOCAL_STATE = 'LS_LOCAL_STATE';

export interface ISource {
  Url: string,
  Position: number,
  Date: Date,
  Hash?: number, // TODO: make neccesary
}

export interface ILocalSource extends ISource {
  Raw: string
}

export interface IAppSharedState {
  Sources: ISource[],
  Appearance: IAppearance
}

export interface IAppLocalState {
  LastSource?: ILocalSource,
  Login?: string,
  Token?: string
}

class _Store {
  private _sharedState: IAppSharedState = {
    Sources: [],
    Appearance: DefaultAppearance
  }

  private _localState: IAppLocalState = { }

  private get _authHeaders() {
    if (!this._localState.Token) {
      throw Error('Auth Token is undefined');
    }

    return { Authorization: `Bearer ${this._localState.Token}`};
  }

  constructor() {
    if (LS_LOCAL_STATE in localStorage) {
      this._localState = JSON.parse(localStorage[LS_LOCAL_STATE]);
    }

    if (this._localState.Token) {
      this.Restore();
    }
  }

  SaveLocalState() {
    localStorage[LS_LOCAL_STATE] = JSON.stringify(this._localState);
  }

  async Signup(login: string, password: string) {
    await Axios.post(`${Server}/Signup`, undefined, { params: { login, password } });

    await this.Signin(login, password);
  }

  async Signin(login: string, password: string) {
    const response = await Axios.post(`${Server}/Signin`, undefined, { params: { login, password } });

    this._localState.Token = response.data;
    this._localState.Login = login;

    this.SaveLocalState();
  }

  Logout() {
    delete this._localState.Login;
    delete this._localState.Token;

    this.SaveLocalState();
  }

  async Restore() {
    const response = await Axios.get(`${Server}/data`, { headers: this._authHeaders });

    this._sharedState = response.data as IAppSharedState;
  }

  async SaveSharedState() {
    const last = this._localState.LastSource;

    if (last) {
      const sharedSource = this._sharedState.Sources.find(s => s.Url === last.Url);

      if (sharedSource) {
        sharedSource.Position = last.Position;
        sharedSource.Date = last.Date;
      }
    }

    await Axios.post(`${Server}/data`, this._sharedState, { headers: this._authHeaders });
  }

  get ShareState() {
    return this._sharedState;
  }

  get LocalState() {
    return this._localState;
  }
}

export const Store = new _Store();
