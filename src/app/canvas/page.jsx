"use client";

import Header from "@/components/layout/Header";
import CanvasDrawingArea from "@/components/pages/canvas/CanvasDrawingArea";
import CanvasPreviewArea from "@/components/pages/canvas/CanvasPreviewArea";

export default function CanvasPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] px-10">
      <Header />

      <div className="flex gap-6 pt-6">
        {/* Left Column - Drawing Canvas */}
        <CanvasDrawingArea />

        {/* Right Column - Live Preview */}
        <CanvasPreviewArea />
      </div>
    </div>
  );
}








