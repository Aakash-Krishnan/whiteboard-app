import { useEffect, useRef } from "react";
import type { TEllipse, TElement, TLine, TPoint, TRectangle, TStroke } from "@whiteboard/types";
import { ARROW_HEADS, DASH_STYLES, FILL_MODES, TOOLS } from "@whiteboard/types/constants/global";
import { useCanvasStore } from "@/store/canvasStore";

type DrawContext = {
  getState: typeof useCanvasStore.getState;
  addElement: (el: TElement) => void;
  updateLastElement: (updater: (el: TElement) => TElement) => void;
  addPoint: (point: TPoint) => void;
  origin: TPoint;
};

type ToolHandler = {
  onDown: (point: TPoint, ctx: DrawContext) => void;
  onMove: (point: TPoint, ctx: DrawContext) => void;
};

const toolHandlers: Partial<Record<string, ToolHandler>> = {
  [TOOLS.PENCIL]: {
    onDown: (point, { addElement, getState }) => {
      const { activeColor, activeThickness, isEraser, activeTool } =
        getState();
      const stroke: TStroke = {
        path: [point],
        color: activeColor,
        tool: activeTool as TStroke["tool"],
        thickness: activeThickness,
        isEraser,
      };
      addElement(stroke);
    },
    onMove: (point, { addPoint }) => {
      addPoint(point);
    },
  },

  [TOOLS.CIRCLE]: {
    onDown: (point, { addElement, getState }) => {
      const { activeColor, activeThickness, fillMode, activeTool } = getState();
      const ellipse: TEllipse = {
        x: point.x,
        y: point.y,
        radiusX: 0,
        radiusY: 0,
        color: activeColor,
        thickness: activeThickness,
        tool: activeTool as TEllipse["tool"],
        fillMode,
      };
      addElement(ellipse);
    },
    onMove: (point, { updateLastElement, origin }) => {
      const dx = point.x - origin.x;
      const dy = point.y - origin.y;
      updateLastElement((el) => ({
        ...el,
        x: origin.x + dx / 2,
        y: origin.y + dy / 2,
        radiusX: Math.abs(dx / 2),
        radiusY: Math.abs(dy / 2),
      }));
    },
  },

  [TOOLS.LINE]: {
    onDown: (point, { addElement, getState }) => {
      const { activeColor, activeThickness, dashStyle, arrowHead, activeTool } = getState();
      const line: TLine = {
        x: point.x,
        y: point.y,
        endPoint: { x: point.x, y: point.y },
        color: activeColor,
        thickness: activeThickness,
        tool: activeTool as TLine["tool"],
        dashStyle,
        arrowHead,
      };
      addElement(line);
    },
    onMove: (point, { updateLastElement }) => {
      updateLastElement((el) => ({ ...el, endPoint: point }));
    },
  },

  [TOOLS.RECTANGLE]: {
    onDown: (point, { addElement, getState }) => {
      const { activeColor, activeThickness, fillMode, activeTool } = getState();
      const rect: TRectangle = {
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color: activeColor,
        thickness: activeThickness,
        tool: activeTool as TRectangle["tool"],
        fillMode,
      };
      addElement(rect);
    },
    onMove: (point, { updateLastElement, origin }) => {
      updateLastElement((el) => ({
        ...el,
        width: point.x - origin.x,
        height: point.y - origin.y,
      }));
    },
  },
};

// --- renderers ---

type ElementRenderer = (ctx: CanvasRenderingContext2D, el: TElement) => void;

const elementRenderers: Partial<Record<string, ElementRenderer>> = {
  [TOOLS.PENCIL]: (ctx, el) => {
    const stroke = el as TStroke;
    ctx.globalCompositeOperation = stroke.isEraser
      ? "destination-out"
      : "source-over";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    stroke.path.forEach((point, idx) => {
      const { x, y } = point;
      if (idx === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (idx < stroke.path.length - 1) {
        const next = stroke.path[idx + 1]!;
        const m2 = { x: (next.x + x) / 2, y: (next.y + y) / 2 };
        ctx.quadraticCurveTo(x, y, m2.x, m2.y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  },

  [TOOLS.LINE]: (ctx, el) => {
    const line = el as TLine;
    ctx.globalCompositeOperation = "source-over";

    const dashMap = { [DASH_STYLES.SOLID]: [], [DASH_STYLES.DASHED]: [8, 4], [DASH_STYLES.DOTTED]: [2, 4] } as const;
    ctx.setLineDash([...dashMap[line.dashStyle]]);

    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(line.endPoint.x, line.endPoint.y);
    ctx.stroke();

    const angle = Math.atan2(line.endPoint.y - line.y, line.endPoint.x - line.x);
    const arrowLen = Math.max(12, line.thickness * 4);
    const spread = Math.PI / 7;

    function drawChevron(tipX: number, tipY: number, dir: number) {
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(tipX - arrowLen * Math.cos(dir - spread), tipY - arrowLen * Math.sin(dir - spread));
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(tipX - arrowLen * Math.cos(dir + spread), tipY - arrowLen * Math.sin(dir + spread));
      ctx.stroke();
    }

    if (line.arrowHead === ARROW_HEADS.START || line.arrowHead === ARROW_HEADS.BOTH)
      drawChevron(line.x, line.y, angle + Math.PI);
    if (line.arrowHead === ARROW_HEADS.BOTH)
      drawChevron(line.endPoint.x, line.endPoint.y, angle);

    ctx.setLineDash([]);
  },

  [TOOLS.CIRCLE]: (ctx, el) => {
    const ellipse = el as TEllipse;
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.ellipse(ellipse.x, ellipse.y, ellipse.radiusX, ellipse.radiusY, 0, 0, Math.PI * 2);
    if (ellipse.fillMode === FILL_MODES.FILLED) {
      ctx.fillStyle = ellipse.color ?? "rgba(0,0,0,1)";
      ctx.fill();
    } else {
      ctx.stroke();
    }
  },

  [TOOLS.RECTANGLE]: (ctx, el) => {
    const rect = el as TRectangle;
    ctx.globalCompositeOperation = "source-over";
    if (rect.fillMode === FILL_MODES.FILLED) {
      ctx.fillStyle = rect.color ?? "rgba(0,0,0,1)";
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  },
};

function drawElement(ctx: CanvasRenderingContext2D, element: TElement) {
  ctx.strokeStyle = element.color ?? "rgba(0,0,0,1)";
  ctx.lineWidth = element.thickness;
  elementRenderers[element.tool]?.(ctx, element);
}

function reDraw(ctx: CanvasRenderingContext2D | null, elements: TElement[]) {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  elements.forEach((el) => drawElement(ctx, el));
}

// --- hook ---

export function useDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
): void {
  const { getState } = useCanvasStore;
  const addElement = useCanvasStore((state) => state.addElement);
  const updateLastElement = useCanvasStore((state) => state.updateLastElement);
  const addPoint = useCanvasStore((state) => state.addPoint);
  const isDrawing = useRef(false);
  const originRef = useRef<TPoint | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      const point = getPointFromEvent(canvas, e);
      originRef.current = point;

      const drawCtx: DrawContext = {
        getState,
        addElement,
        updateLastElement,
        addPoint,
        origin: point,
      };

      toolHandlers[getState().activeTool]?.onDown(point, drawCtx);
      reDraw(ctx, getState().elements);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      isDrawing.current = false;
      originRef.current = null;
    };

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!isDrawing.current || !originRef.current) return;

      const point = getPointFromEvent(canvas, e);
      const drawCtx: DrawContext = {
        getState,
        addElement,
        updateLastElement,
        addPoint,
        origin: originRef.current,
      };

      toolHandlers[getState().activeTool]?.onMove(point, drawCtx);

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => reDraw(ctx, getState().elements));
    };

    const handleMouseLeave = (e: MouseEvent) => {
      e.preventDefault();
      isDrawing.current = false;
      originRef.current = null;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [canvasRef, addElement, updateLastElement, addPoint, getState]);
}

function getPointFromEvent(canvas: HTMLCanvasElement, e: MouseEvent): TPoint {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
