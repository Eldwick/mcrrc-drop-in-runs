"use client";

import { useRef, useCallback, useState } from "react";

type SnapState = "collapsed" | "half" | "full";

interface BottomSheetProps {
  snapState: SnapState;
  onSnapStateChange: (state: SnapState) => void;
  summary: string;
  children: React.ReactNode;
}

const HANDLE_HEIGHT = 70;

function getTranslateY(state: SnapState): string {
  switch (state) {
    case "collapsed":
      return `calc(100% - ${HANDLE_HEIGHT}px)`;
    case "half":
      return "calc(100% - 50vh)";
    case "full":
      return "0px";
  }
}

function getVisibleHeight(state: SnapState, viewportHeight: number): number {
  switch (state) {
    case "collapsed":
      return HANDLE_HEIGHT;
    case "half":
      return viewportHeight * 0.5;
    case "full":
      return viewportHeight - 40;
  }
}

function nearestSnap(visibleHeight: number, viewportHeight: number): SnapState {
  const collapsedH = HANDLE_HEIGHT;
  const halfH = viewportHeight * 0.5;
  const fullH = viewportHeight - 40;

  const midCollapseHalf = (collapsedH + halfH) / 2;
  const midHalfFull = (halfH + fullH) / 2;

  if (visibleHeight < midCollapseHalf) return "collapsed";
  if (visibleHeight < midHalfFull) return "half";
  return "full";
}

export const BottomSheet = ({
  snapState,
  onSnapStateChange,
  summary,
  children,
}: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startVisibleHeight = useRef(0);
  const [currentTranslateY, setCurrentTranslateY] = useState<string | null>(null);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const translateY = currentTranslateY ?? getTranslateY(snapState);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      startY.current = e.clientY;
      startVisibleHeight.current = getVisibleHeight(
        snapState,
        window.innerHeight
      );
      setTransitionEnabled(false);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [snapState]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaY = startY.current - e.clientY;
    const newVisibleHeight = Math.max(
      HANDLE_HEIGHT,
      Math.min(window.innerHeight - 40, startVisibleHeight.current + deltaY)
    );
    const sheetHeight = window.innerHeight - 40;
    const newTranslateY = sheetHeight - newVisibleHeight;
    setCurrentTranslateY(`${newTranslateY}px`);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

      const deltaY = startY.current - e.clientY;
      const newVisibleHeight = Math.max(
        HANDLE_HEIGHT,
        Math.min(
          window.innerHeight - 40,
          startVisibleHeight.current + deltaY
        )
      );

      const snap = nearestSnap(newVisibleHeight, window.innerHeight);
      setTransitionEnabled(true);
      setCurrentTranslateY(null);
      onSnapStateChange(snap);
    },
    [onSnapStateChange]
  );

  const handleHandleClick = useCallback(() => {
    if (snapState === "collapsed") {
      onSnapStateChange("half");
    } else if (snapState === "half") {
      onSnapStateChange("collapsed");
    }
  }, [snapState, onSnapStateChange]);

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-10 flex flex-col rounded-t-2xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
      style={{
        height: "calc(100vh - 40px)",
        transform: `translateY(${translateY})`,
        transition: transitionEnabled
          ? "transform 300ms ease-out"
          : "none",
      }}
    >
      {/* Handle area */}
      <div
        className="flex shrink-0 cursor-grab flex-col items-center pb-2 pt-3 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleHandleClick}
      >
        <div className="h-1 w-10 rounded-full bg-gray-300" />
        <p className="mt-2 text-sm font-medium text-gray-600">{summary}</p>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6">
        {children}
      </div>
    </div>
  );
};
