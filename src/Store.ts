import Axios, { AxiosError, AxiosResponse } from 'axios';
import { DefaultLocalState, DefaultSharedState, IAppLocalState, IAppSharedState } from './State';
import _ from 'lodash';

const Server = 'https://store42.azurewebsites.net';
const LS_LOCAL_STATE = 'LS_LOCAL_STATE';

interface RemoteStoreResponse {
  DataWasChanged: boolean | undefined,
  Timestamp: number,
  Data: IAppSharedState
}

class _Store {
  private _localState: IAppLocalState = DefaultLocalState;

  private get _authHeaders() {
    if (!this._localState.Token) {
      throw Error('Auth Token is undefined');
    }

    return { Authorization: `Bearer ${this._localState.Token}` };
  }

  constructor() {
    this.restoreLocalState();
  }

  Get(): Readonly<IAppLocalState> {
    return this._localState;
  }

  Set(changes: Partial<IAppLocalState>) {
    this._localState = { ...this._localState, ...changes };

    this.saveLocalState();
  }

  private saveLocalState() {
    localStorage[LS_LOCAL_STATE] = JSON.stringify(this._localState);
  }

  private restoreLocalState() {
    if (LS_LOCAL_STATE in localStorage) {
      this.Set(JSON.parse(localStorage[LS_LOCAL_STATE]));
    }

    if (this._localState.Token) {
      this.RestoreShareState();
    }
  }

  async Signup(login: string, password: string) {
    await Axios.post(`${Server}/Signup`, undefined, { params: { login, password } });

    await this.Signin(login, password);
  }

  async Signin(login: string, password: string) {
    const response = await Axios.post(`${Server}/Signin`, undefined, { params: { login, password } });

    this._localState.Token = response.data;
    this._localState.Login = login;

    this.saveLocalState();
  }

  Logout() {
    delete this._localState.Login;
    delete this._localState.Token;

    this.saveLocalState();
  }

  async RestoreShareState() {
    try {
      const response = await Axios.get<RemoteStoreResponse>(`${Server}/data`, { headers: this._authHeaders });

      this.MergeSharedStates(response.data);
    } catch (err) {
      this.handleAxiosError(err);
    }
  }

  async SaveSharedState() {
    const last = this._localState.LastSource;

    if (last) {
      const sharedSource = this._localState.SharedState?.Sources.find(s => s.Url === last.Url);

      if (sharedSource) {
        sharedSource.Position = last.Position;
        sharedSource.Date = last.Date;
      }
    }

    const response = await Axios.post<RemoteStoreResponse>(`${Server}/data`, this._localState.SharedState, { headers: this._authHeaders, params: { unixTimestamp: this._localState.SharedStateTimestamp } });

    if (response.data.DataWasChanged) {
      this.MergeSharedStates(response.data);

      await this.SaveSharedState();
    }
  }

  MergeSharedStates(response: RemoteStoreResponse) {
    const remote = response.Data;

    const result = this._localState.SharedState || DefaultSharedState;

    remote.Sources.forEach(rs => {
      const localSource = result.Sources.find(ls => ls.Url === rs.Url || ls.Hash === rs.Hash);

      if (!localSource) {
        result.Sources.push(rs);
      } else if (rs.Date > localSource.Date) {
        localSource.Position = rs.Position;
        localSource.Date = rs.Date;
      }
    });

    remote.Dictionary.forEach(rdr => {
      const localDictRecord = result.Dictionary.find(ldr => ldr.BaseWord === rdr.BaseWord);

      if (!localDictRecord) {
        result.Dictionary.push(rdr);
      } else {
        // TODO merge exercises
        localDictRecord.Antonyms = _.uniq([...localDictRecord.Antonyms || [], ...rdr.Antonyms || []]);
        localDictRecord.Examples = _.uniq([...localDictRecord.Examples || [], ...rdr.Examples || []]);
        localDictRecord.Forms = _.uniq([...localDictRecord.Forms || [], ...rdr.Forms || []]);
        localDictRecord.PronounceAudioUrls = _.uniq([...localDictRecord.PronounceAudioUrls || [], ...rdr.PronounceAudioUrls || []]);
        localDictRecord.Synonyms = _.uniq([...localDictRecord.Synonyms || [], ...rdr.Synonyms || []]);
      }
    });

    this.Set({
      SharedStateTimestamp: response.Timestamp,
      SharedState: result
    });
  }

  private handleAxiosError(err: AxiosError) {
    if (err.response) {
      if (err.response.status === 401) {
        delete this._localState.Token;
        delete this._localState.Login;
      }
    }
  }
}

export const Store = new _Store();
