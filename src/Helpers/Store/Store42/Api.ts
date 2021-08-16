import Axios, { AxiosError, AxiosResponse } from 'axios';
import _ from 'lodash';
import { LocalStore } from '../LocalStore';

const DebugToken = '8D746162-59F6-4D50-B85D-D132B64C831B';
export const Server = 'https://store42.azurewebsites.net';
//export const Server = 'https://localhost:44385';

export interface IAuthState {
  Login?: string,
  Token?: string
}

export class Store42Api {
  constructor(private store: LocalStore<IAuthState>) { }

  private get _authHeaders() {
    const { Token: token } = this.store.Get();

    if (!token) {
      throw Error('Auth Token is undefined');
    }

    return { Authorization: `Bearer ${token}`, DebugToken }; // TODO: add DEV flag
  }

  async Signup(login: string, password: string) {
    await Axios.post(`${Server}/Signup`, undefined, { params: { login, password } });

    await this.Signin(login, password);
  }

  async Signin(login: string, password: string) {
    const response = await Axios.post(`${Server}/Signin`, undefined, { params: { login, password } });

    this.store.Set({ Login: login, Token: response.data });
  }

  async CORSProxy(url: string, headers?: any, method?: 'POST' | 'GET') {
    let throughCORSUrl = `${Server}/proxy?url=${encodeURIComponent(url)}`;

    if (method) {
      throughCORSUrl += `&method=${method}`;
    }

    return await Axios.get(throughCORSUrl, { headers: { ...this._authHeaders, ...headers } });
  }

  Logout() {
    this.store.Set({ Login: undefined, Token: undefined });
  }

  async Get$<T>(method: string) {
    try {
      return await Axios.get<T>(`${Server}/${method}`, { headers: this._authHeaders });
    } catch (err) {
      if (!this.handleAxiosError(err)) {
        throw err;
      }
    }
  }

  async Post$<TResponse>(method: string, data: unknown, params?: unknown) {
    try {
      return await Axios.post<TResponse>(`${Server}/${method}`, data, { headers: this._authHeaders, params });
    } catch (err) {
      if (!this.handleAxiosError(err)) {
        throw err;
      }
    }
  }

  private handleAxiosError(err: AxiosError) {
    if (err.response) {
      if (err.response.status === 401) {
        this.Logout();

        return true;
      }
    }
  }
}
