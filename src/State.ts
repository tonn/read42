import { BehaviorSubject } from 'rxjs';
import { DefaultAppearance, IAppearanceProfile } from './Appearance';

export interface ISource {
  Url: string,
  Position: number,
  Date: Date,
  Hash?: number
}

export interface ILocalSource extends ISource {
  Raw: string
}

export interface IDictionaryRecord {
  BaseWord: string,
  Transcription?: string,
  Translations?: string[],
  // Forms?: string[],
  // Synonyms?: string[],
  // Antonyms?: string[],
  // Examples?: string[],
  // PronounceAudioUrls?: string[],
  // ExerciseHistory?: {
  //   ExerciseType: string,
  //   Date: Date,
  //   Success: number
  // }[]
}

export interface IAppSharedState {
  Sources: ISource[],
  Profiles: IAppearanceProfile[],
  Dictionary: IDictionaryRecord[]
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

export interface IAppLocalState {
  Login?: string,
  Token?: string,
  LastSource?: ILocalSource,
  SharedState: IAppSharedState,
  SharedStateTimestamp?: number
}

export const DefaultLocalState: IAppLocalState = {
  SharedState: DefaultSharedState
}

const _state$ = new BehaviorSubject<Readonly<IAppLocalState>>(DefaultLocalState);

export const State$ = _state$.asObservable();

export function SetState(changes: Partial<IAppLocalState>) {
  _state$.next(deepAssign(_state$.value, changes));
}

function deepAssign<T extends Object>(target: any, ...sources: Partial<T>[]): T {
  for (const source of sources) {
    for (const propName in source) {
      if (source.hasOwnProperty && source.hasOwnProperty(propName)) {
        const propValue = source[propName] as any;

        if (typeof(propValue) === 'object') {
          target[propName] = deepAssign({}, target[propName] || {}, propValue || {});
        } else {
          target[propName] = propValue;
        }
      }
    }
   }

  return target;
}
