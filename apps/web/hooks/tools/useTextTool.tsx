import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TText } from "@whiteboard/types";
import { useCanvasStore } from "@/store/canvasStore";
import type { ElementRenderer, ToolDefinition, ToolHandler } from "../drawing/types";
import { historyManager } from "@/history/HistoryManager";
import { CommitLastElementCommand } from "@/history/commands/CommitLastElementCommand";

const renderer: ElementRenderer = (ctx, el) => {
  const text = el as TText;
  if (!text.content) return;
  ctx.globalCompositeOperation = "source-over";
  ctx.font = `${text.fontSize}px sans-serif`;
  ctx.fillStyle = text.color ?? "rgba(0,0,0,1)";

  const lines = text.content.split("\n");
  lines.forEach((line, i) => {
    ctx.fillText(line, text.x, text.y + i * text.fontSize * 1.2);
  });
};

export function useTextTool(): ToolDefinition & { portal: React.ReactNode } {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const { setState } = useCanvasStore;

  const discard = useCallback(() => {
    const id = activeIdRef.current;
    if (!id) return;

    setState((state) => ({
      elements: state.elements.filter(
        (el) => !(el.tool === "text" && (el as TText).id === id),
      ),
    }));

    activeIdRef.current = null;
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.display = "none";
      textarea.value = "";
    }
  }, [setState]);

  const commit = useCallback(() => {
    const textarea = textareaRef.current;
    const id = activeIdRef.current;
    if (!textarea || !id) return;

    const content = textarea.value.trim();

    if (content) {
      setState((state) => ({
        elements: state.elements.map((el) =>
          el.tool === "text" && (el as TText).id === id
            ? { ...el, content }
            : el,
        ),
      }));
      historyManager.execute(new CommitLastElementCommand());
    } else {
      setState((state) => ({
        elements: state.elements.filter(
          (el) => !(el.tool === "text" && (el as TText).id === id),
        ),
      }));
    }

    activeIdRef.current = null;
    textarea.style.display = "none";
    textarea.value = "";
  }, [setState]);

  const handler: ToolHandler = {
    onDown: (point, { addElement, getState }) => {
      const { activeColor, activeFontSize, activeTool } = getState();

      if (activeIdRef.current) commit();

      const id = crypto.randomUUID();
      const el: TText = {
        id,
        x: point.x,
        y: point.y,
        content: "",
        color: activeColor,
        fontSize: activeFontSize,
        thickness: 0,
        tool: activeTool as TText["tool"],
      };

      activeIdRef.current = id;
      addElement(el);

      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.style.display = "block";
      textarea.style.left = `${point.x}px`;
      textarea.style.top = `${point.y}px`;
      textarea.style.fontSize = `${activeFontSize}px`;
      textarea.style.color = activeColor;
      textarea.value = "";
      textarea.focus();
    },
    onMove: () => {},
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const portal = mounted
    ? createPortal(
        <textarea
          ref={textareaRef}
          className="fixed z-50 resize-none overflow-hidden border-none bg-transparent outline-none"
          style={{ display: "none", minWidth: 120, minHeight: 40 }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              discard();
            }
          }}
          onChange={(e) => {
            const el = e.currentTarget;
            el.style.width = "auto";
            el.style.height = "auto";
            el.style.width = `${el.scrollWidth}px`;
            el.style.height = `${el.scrollHeight}px`;
          }}
        />,
        document.body,
      )
    : null;

  return { handler, renderer, portal };
}
