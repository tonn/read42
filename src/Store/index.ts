import _ from 'lodash';
import { LocalStore } from '../Helpers/Store/LocalStore';
import { Store42Api, IAuthState } from '../Helpers/Store/Store42/Api';
import { Store42Sync } from '../Helpers/Store/Store42/Sync';
import { IAppLocalState, DefaultLocalState } from './IAppLocalState';
import { IAppSharedState } from './IAppSharedState';

export const Store = new LocalStore<IAppLocalState>(['Login', 'Token', 'LastSource', 'SharedState', 'SharedStateTimestamp'], DefaultLocalState, 'R42_');

export const Api = new Store42Api(Store as unknown as LocalStore<IAuthState>);

export const Sync = new Store42Sync(Api, Store, merge);

function merge(local: IAppSharedState, remote: IAppSharedState) {
  const result = { ...local };

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
    const ldr = result.Dictionary.find(ldr => ldr.BaseWord === rdr.BaseWord);

    if (!ldr) {
      result.Dictionary.push(rdr);
    } else {
      ldr.Transcription = rdr.Transcription || ldr.Transcription;
      ldr.Learning = ldr.Learning || rdr.Learning;
      ldr.Translations = _.uniq([...ldr.Translations, ...rdr.Translations]);
    }
  });

  return result;
}
