import { useEffect, useMemo, useRef } from "react";
import type { TPoint } from "@whiteboard/types";
import { TOOLS } from "@whiteboard/types/constants/global";
import { useCanvasStore } from "@/store/canvasStore";
import { reDraw } from "./drawing/reDraw";
import type { DrawContext } from "./drawing/types";
import { useEllipseTool } from "./tools/useEllipseTool";
import { useLineTool } from "./tools/useLineTool";
import { usePencilTool } from "./tools/usePencilTool";
import { useRectangleTool } from "./tools/useRectangleTool";
import { useTextTool } from "./tools/useTextTool";
import { historyManager } from "@/history/HistoryManager";
import { AddElementCommand } from "@/history/commands/AddElementCommand";

export function useDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
): { portal: React.ReactNode } {
  const { getState } = useCanvasStore;
  const addElement = useCanvasStore((state) => state.addElement);
  const updateLastElement = useCanvasStore((state) => state.updateLastElement);
  const addPoint = useCanvasStore((state) => state.addPoint);
  const isDrawing = useRef(false);
  const originRef = useRef<TPoint | null>(null);

  // --- register tool strategies ---
  const pencil = usePencilTool();
  const rectangle = useRectangleTool();
  const ellipse = useEllipseTool();
  const line = useLineTool();
  const text = useTextTool();

  const toolHandlers = useMemo(() => ({
    [TOOLS.PENCIL]: pencil.handler,
    [TOOLS.RECTANGLE]: rectangle.handler,
    [TOOLS.CIRCLE]: ellipse.handler,
    [TOOLS.LINE]: line.handler,
    [TOOLS.TEXT]: text.handler,
  }), [pencil.handler, rectangle.handler, ellipse.handler, line.handler, text.handler]);

  const elementRenderers = useMemo(() => ({
    [TOOLS.PENCIL]: pencil.renderer,
    [TOOLS.RECTANGLE]: rectangle.renderer,
    [TOOLS.CIRCLE]: ellipse.renderer,
    [TOOLS.LINE]: line.renderer,
    [TOOLS.TEXT]: text.renderer,
  }), [pencil.renderer, rectangle.renderer, ellipse.renderer, line.renderer, text.renderer]);

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
        commitElement: (element) => {
          historyManager.execute(new AddElementCommand(element));
        },
      };

      toolHandlers[getState().activeTool]?.onDown(point, drawCtx);
      reDraw(ctx, getState().elements, elementRenderers);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      if (isDrawing.current) {
        const drawCtx: DrawContext = {
          getState,
          addElement,
          updateLastElement,
          addPoint,
          origin: originRef.current ?? { x: 0, y: 0 },
          commitElement: (element) => {
            historyManager.execute(new AddElementCommand(element));
          },
        };
        toolHandlers[getState().activeTool]?.onUp?.(drawCtx);
      }
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
        commitElement: (element) => {
          historyManager.execute(new AddElementCommand(element));
        },
      };

      toolHandlers[getState().activeTool]?.onMove(point, drawCtx);

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() =>
        reDraw(ctx, getState().elements, elementRenderers),
      );
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
  }, [canvasRef, addElement, updateLastElement, addPoint, getState, toolHandlers, elementRenderers]);

  // Redraw when elements change externally (undo/redo) while not actively drawing
  useEffect(() => {
    return useCanvasStore.subscribe((state, prev) => {
      if (state.elements !== prev.elements && !isDrawing.current) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        reDraw(ctx, state.elements, elementRenderers);
      }
    });
  }, [canvasRef, elementRenderers]);

  return { portal: text.portal };
}

function getPointFromEvent(canvas: HTMLCanvasElement, e: MouseEvent): TPoint {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
