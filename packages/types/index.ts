import { ARROW_HEADS, CONTROL_TYPES, DASH_STYLES, FILL_MODES, TOOLS } from "./constants/global";

export type TTool = (typeof TOOLS)[keyof typeof TOOLS];

export type TUser = {
  id: string;
  name: string;
  cursorColor: string;
};

export type TFillMode = (typeof FILL_MODES)[keyof typeof FILL_MODES];
export type TDashStyle = (typeof DASH_STYLES)[keyof typeof DASH_STYLES];
export type TArrowHead = (typeof ARROW_HEADS)[keyof typeof ARROW_HEADS];

type TCommonToolProperties = {
  color?: string;
  thickness: number;
  fillMode?: TFillMode;
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
  };

export type TEllipse = TCommonToolProperties &
  TPoint & {
    radiusX: number;
    radiusY: number;
    tool: Extract<TTool, "circle">;
  };

export type TLine = TCommonToolProperties &
  TPoint & {
    endPoint: TPoint;
    tool: Extract<TTool, "line">;
    dashStyle: TDashStyle;
    arrowHead: TArrowHead;
  };

export type TText = TCommonToolProperties &
  TPoint & {
    id: string;
    content: string;
    fontSize: number;
    tool: Extract<TTool, "text">;
  };

export type TElement = TStroke | TRectangle | TEllipse | TLine | TText;
