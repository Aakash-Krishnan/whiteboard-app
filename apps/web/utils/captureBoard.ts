export async function captureBoard(): Promise<string> {
  const mainCanvas = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (!mainCanvas) throw new Error("captureBoard: main canvas not found");

  const stickyLayer = document.querySelector("[data-sticky-layer]") as HTMLElement | null;
  if (!stickyLayer) throw new Error("captureBoard: sticky layer not found");

  const { toCanvas } = await import("html-to-image");

  const stickyCapture = await toCanvas(stickyLayer, {
    backgroundColor: "transparent",
    pixelRatio: window.devicePixelRatio,
  });

  const offscreen = document.createElement("canvas");
  offscreen.width = mainCanvas.width;
  offscreen.height = mainCanvas.height;

  const ctx = offscreen.getContext("2d");
  if (!ctx) throw new Error("captureBoard: could not get 2d context");

  ctx.drawImage(mainCanvas, 0, 0);
  ctx.drawImage(stickyCapture, 0, 0, offscreen.width, offscreen.height);

  return offscreen.toDataURL("image/png");
}
