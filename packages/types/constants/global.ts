export const TOOLS = {
  PENCIL: "pencil",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  LINE: "line",
} as const;

export const TOOL_PROPERTIES = {
  width: {
    thin: 2,
    medium: 4,
    thick: 6,
    bold: 8,
    "extra-bold": 10,
  },
  color: "#000000",
} as const;

export const CONTROL_TYPES = {
  COLOR_PICKER: "color-picker",
  WIDTH_SELECTOR: "width-selector",
  TOGGLE: "toggle",
  DROPDOWN: "dropdown",
} as const;

export const TOOL_CONTROLS = {
  [TOOLS.PENCIL]: [
    { type: CONTROL_TYPES.COLOR_PICKER, label: "Color" },
    { type: CONTROL_TYPES.WIDTH_SELECTOR, label: "Stroke Width" },
    { type: CONTROL_TYPES.TOGGLE, label: "Eraser", stateKey: "isEraser" },
  ],
  [TOOLS.RECTANGLE]: [
    { type: CONTROL_TYPES.COLOR_PICKER, label: "Color" },
    { type: CONTROL_TYPES.WIDTH_SELECTOR, label: "Stroke Width" },
    {
      type: CONTROL_TYPES.DROPDOWN,
      label: "Fill",
      stateKey: "fillMode",
      optionsKey: "fillModeOptions",
    },
  ],
} as const;
