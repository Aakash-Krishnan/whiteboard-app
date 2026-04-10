import { TOOLS } from "./constants/global";

export type TTool = (typeof TOOLS)[keyof typeof TOOLS];

export type TUser = {
  id: string;
  name: string;
  cursorColor: string;
};

export type TPoint = {
  x: number;
  y: number;
};

export type TStroke = {
  path: TPoint[];
  color?: string;
  tool: TTool;
};
