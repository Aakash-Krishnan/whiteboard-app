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
};
