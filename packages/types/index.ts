import { CONTROL_TYPES, TOOLS } from "./constants/global";

export type TTool = (typeof TOOLS)[keyof typeof TOOLS];

export type TUser = {
  id: string;
  name: string;
  cursorColor: string;
};

type TCommonToolProperties = {
  color?: string;
  thickness: number;
};

export type TPoint = {
  x: number;
  y: number;
};

export type TStroke = TCommonToolProperties & {
  path: TPoint[];
  isEraser?: boolean;
  tool: Extract<TTool, "pencil">;
};

export type TControlType = (typeof CONTROL_TYPES)[keyof typeof CONTROL_TYPES];

export type TToolControl = {
  type: TControlType;
  label: string;
  stateKey?: string;
  optionsKey?: string;
};

export type TRectangle = TCommonToolProperties &
  TPoint & {
    width: number;
    height: number;
    tool: Extract<TTool, "rectangle">;
    fillMode: "filled" | "outline";
  };

export type TCircle = TCommonToolProperties &
  TPoint & {
    radius: number;
    tool: Extract<TTool, "circle">;
  };

export type TLine = TCommonToolProperties &
  TPoint & {
    endPoint: TPoint;
    tool: Extract<TTool, "line">;
  };

export type TElement = TStroke | TRectangle | TCircle | TLine;
