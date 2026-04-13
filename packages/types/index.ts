import { CONTROL_TYPES, TOOLS } from "./constants/global";

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
  width: number;
  isEraser?: boolean;
};

export type TControlType = (typeof CONTROL_TYPES)[keyof typeof CONTROL_TYPES];

export type TToolControl = {
  type: TControlType;
  label: string;
  stateKey?: string;
  optionsKey?: string;
};
