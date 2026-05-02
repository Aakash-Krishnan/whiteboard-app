export const TOOLS = {
  PENCIL: "pencil",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  LINE: "line",
  TEXT: "text",
} as const;

export const TOOL_PROPERTIES = {
  width: {
    thin: 2,
    medium: 4,
    thick: 6,
    bold: 8,
    "extra-bold": 10,
  },
  fontSize: {
    small: 14,
    medium: 20,
    large: 28,
    "extra-large": 40,
  },
  color: "#000000",
} as const;

export const CONTROL_TYPES = {
  COLOR_PICKER: "color-picker",
  WIDTH_SELECTOR: "width-selector",
  FONT_SIZE_SELECTOR: "font-size-selector",
  TOGGLE: "toggle",
  DROPDOWN: "dropdown",
} as const;

export const FILL_MODES = {
  OUTLINE: "outline",
  FILLED: "filled",
} as const;

export const DASH_STYLES = {
  SOLID: "solid",
  DASHED: "dashed",
  DOTTED: "dotted",
} as const;

export const ARROW_HEADS = {
  NONE: "none",
  START: "start",
  BOTH: "both",
} as const;

// Reusable control blocks
const COLOR_CONTROL = { type: CONTROL_TYPES.COLOR_PICKER, label: "Color" } as const;
const WIDTH_CONTROL = { type: CONTROL_TYPES.WIDTH_SELECTOR, label: "Stroke Width" } as const;
const FILL_CONTROL = {
  type: CONTROL_TYPES.DROPDOWN,
  label: "Fill",
  stateKey: "fillMode",
  optionsKey: "fillModeOptions",
} as const;
const DASH_CONTROL = {
  type: CONTROL_TYPES.DROPDOWN,
  label: "Dash",
  stateKey: "dashStyle",
  optionsKey: "dashStyleOptions",
} as const;
const ARROW_CONTROL = {
  type: CONTROL_TYPES.DROPDOWN,
  label: "Arrow",
  stateKey: "arrowHead",
  optionsKey: "arrowHeadOptions",
} as const;
const ERASER_CONTROL = {
  type: CONTROL_TYPES.TOGGLE,
  label: "Eraser",
  stateKey: "isEraser",
} as const;

const FONT_SIZE_CONTROL = {
  type: CONTROL_TYPES.FONT_SIZE_SELECTOR,
  label: "Font Size",
} as const;

export const TOOL_CONTROLS = {
  [TOOLS.PENCIL]: [COLOR_CONTROL, WIDTH_CONTROL, ERASER_CONTROL],
  [TOOLS.RECTANGLE]: [COLOR_CONTROL, WIDTH_CONTROL, FILL_CONTROL],
  [TOOLS.CIRCLE]: [COLOR_CONTROL, WIDTH_CONTROL, FILL_CONTROL],
  [TOOLS.LINE]: [COLOR_CONTROL, WIDTH_CONTROL, DASH_CONTROL, ARROW_CONTROL],
  [TOOLS.TEXT]: [COLOR_CONTROL, FONT_SIZE_CONTROL],
} as const;
