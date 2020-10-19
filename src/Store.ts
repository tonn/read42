import Axios from 'axios';
import { DefaultAppearance, IAppearance } from './AppearanceConfig';

const Server = 'https://store42.azurewebsites.net';
const LS_LOGIN = 'Login';
const LS_TOKEN = 'Token';

export interface IAppState {
  Sources: {
    Url: string,
    Position: number
  }[],
  Appearance: IAppearance
}

class _Store {
  private _login: string | undefined;
  private _authToken: string | undefined;
  private _state: IAppState = {
    Sources: [],
    Appearance: DefaultAppearance
  }

  private get _authHeaders() {
    if (!this._authToken) {
      throw Error('Auth Token is undefined');
    }

    return { Authorization: `Bearer ${this._authToken}`};
  }

  constructor() {
    this._authToken = localStorage[LS_TOKEN];
    this._login = localStorage[LS_LOGIN];
  }

  async Signup(login: string, password: string) {
    await Axios.post(`${Server}/Signup`, undefined, { params: { login, password } });

    await this.Signin(login, password);
  }

  async Signin(login: string, password: string) {
    const response = await Axios.post(`${Server}/Signin`, undefined, { params: { login, password } });

    localStorage[LS_TOKEN] = this._authToken = response.data;
    localStorage[LS_LOGIN] = this._login = login;
  }

  Logout() {
    localStorage[LS_TOKEN] = this._authToken = undefined;
    localStorage[LS_LOGIN] = this._login = undefined;
    delete localStorage[LS_TOKEN];
    delete localStorage[LS_LOGIN];
  }

  async Restore() {
    const response = await Axios.get(`${Server}/data`, { headers: this._authHeaders });

    this._state = response.data as IAppState;
  }

  async Save() {
    await Axios.post(`${Server}/data`, this._state, { headers: this._authHeaders });
  }

  get State() {
    return this._state;
  }

  get Login() {
    return this._login;
  }
}

export const Store = new _Store();
