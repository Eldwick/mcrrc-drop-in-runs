"use client";

import { useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { PACE_RANGE_LABELS } from "@/lib/types/run";
import type { PaceRange } from "@/lib/types/run";

const paceRangeKeys: PaceRange[] = ["sub_8", "8_to_9", "9_to_10", "10_plus"];

interface PaceSelectorProps {
  selectedPace: PaceRange | null;
  onSelectPace: (pace: PaceRange) => void;
  highlight?: boolean;
}

export interface PaceSelectorHandle {
  focus: () => void;
}

export const PaceSelector = forwardRef<PaceSelectorHandle, PaceSelectorProps>(
  ({ selectedPace, onSelectPace, highlight }, ref) => {
    const [focusedIndex, setFocusedIndex] = useState(0);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        let nextIndex: number | null = null;

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          nextIndex = (focusedIndex + 1) % paceRangeKeys.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          nextIndex =
            (focusedIndex - 1 + paceRangeKeys.length) % paceRangeKeys.length;
        }

        if (nextIndex !== null) {
          setFocusedIndex(nextIndex);
          buttonRefs.current[nextIndex]?.focus();
        }
      },
      [focusedIndex]
    );

    useImperativeHandle(
      ref,
      () => ({
        focus: () => buttonRefs.current[focusedIndex]?.focus(),
      }),
      [focusedIndex]
    );

    return (
      <div>
        <p className={`mb-1.5 text-xs font-medium ${
          highlight && !selectedPace
            ? "text-brand-orange"
            : "text-gray-500"
        }`}>
          {highlight && !selectedPace ? "Select your pace (min/mile)" : "Your pace (min/mile)"}
        </p>
        <div className="grid grid-cols-4 gap-1" role="radiogroup" aria-label="Pace range">
          {paceRangeKeys.map((pace, i) => (
          <button
            key={pace}
            ref={(el) => { buttonRefs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={selectedPace === pace}
            tabIndex={i === focusedIndex ? 0 : -1}
            onClick={() => onSelectPace(pace)}
            onFocus={() => setFocusedIndex(i)}
            onKeyDown={handleKeyDown}
            className={`rounded-md px-2 py-2 text-xs font-medium transition-colors focus:ring-2 focus:ring-brand-purple focus:ring-offset-1 focus:outline-none ${
              selectedPace === pace
                ? "bg-brand-purple text-white"
                : "bg-brand-gray text-gray-600 hover:bg-gray-200"
            }`}
          >
            {PACE_RANGE_LABELS[pace]}
          </button>
          ))}
        </div>
      </div>
    );
  }
);

PaceSelector.displayName = "PaceSelector";
