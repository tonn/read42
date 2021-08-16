export interface IAppearance {
  Id: string;
  FontSize: number;
  FontFamily: string;
  LineHeight: number;
  Background: string;
  Padding: number[];
  Color: string;
}

export const DefaultAppearance: IAppearance = {
  Id: 'default',
  Color: '#222',
  Background: '#CCA',
  FontFamily: 'arial',
  FontSize: 5,
  LineHeight: 1.5,
  Padding: [ 5, 5, 5, 5 ],
};
