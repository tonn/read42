import { IAppearance } from "./Appearance";

export interface IAppearanceProfile {
  Name: string;
  Mode: 'day' | 'night';
  Appearance: IAppearance;
}
