import { IColor } from './i-color';

export interface IPixel {
  id?: string; // from firestore
  x: number;
  y: number;
  color: IColor;
}
