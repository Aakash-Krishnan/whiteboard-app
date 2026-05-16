import { captureBoard } from "./captureBoard";

export async function exportPDF(): Promise<void> {
  const dataUrl = await captureBoard();

  const { jsPDF } = await import("jspdf");

  const pageW = 297;
  const pageH = 210;

  // Measure the image's natural pixel dimensions
  const imgDims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("exportPDF: failed to load captured image"));
    img.src = dataUrl;
  });

  const scale = Math.min(pageW / imgDims.w, pageH / imgDims.h);
  const drawW = imgDims.w * scale;
  const drawH = imgDims.h * scale;
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.addImage(dataUrl, "PNG", x, y, drawW, drawH);
  doc.save("whiteboard.pdf");
}
