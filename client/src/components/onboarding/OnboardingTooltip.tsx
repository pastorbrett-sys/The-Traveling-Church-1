import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ArrowPosition = "top" | "bottom" | "left" | "right";

interface TooltipPosition {
  x: number;
  y: number;
  arrow: ArrowPosition;
  arrowOffset: number;
}

interface OnboardingTooltipProps {
  targetRef: React.RefObject<HTMLElement>;
  text: string;
  visible: boolean;
  onDismiss: () => void;
  className?: string;
}

const TOOLTIP_PADDING = 16;
const ARROW_SIZE = 10;
const GAP = 12;

function calculatePosition(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number
): TooltipPosition {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const spaceAbove = targetRect.top;
  const spaceBelow = viewport.height - targetRect.bottom;
  const spaceLeft = targetRect.left;
  const spaceRight = viewport.width - targetRect.right;

  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  let x: number;
  let y: number;
  let arrow: ArrowPosition;

  if (spaceBelow >= tooltipHeight + GAP + TOOLTIP_PADDING || spaceBelow >= spaceAbove) {
    arrow = "top";
    y = targetRect.bottom + GAP;
    x = Math.max(
      TOOLTIP_PADDING,
      Math.min(targetCenterX - tooltipWidth / 2, viewport.width - tooltipWidth - TOOLTIP_PADDING)
    );
  } else if (spaceAbove >= tooltipHeight + GAP + TOOLTIP_PADDING) {
    arrow = "bottom";
    y = targetRect.top - tooltipHeight - GAP;
    x = Math.max(
      TOOLTIP_PADDING,
      Math.min(targetCenterX - tooltipWidth / 2, viewport.width - tooltipWidth - TOOLTIP_PADDING)
    );
  } else if (spaceRight >= spaceLeft) {
    arrow = "left";
    x = targetRect.right + GAP;
    y = Math.max(
      TOOLTIP_PADDING,
      Math.min(targetCenterY - tooltipHeight / 2, viewport.height - tooltipHeight - TOOLTIP_PADDING)
    );
  } else {
    arrow = "right";
    x = targetRect.left - tooltipWidth - GAP;
    y = Math.max(
      TOOLTIP_PADDING,
      Math.min(targetCenterY - tooltipHeight / 2, viewport.height - tooltipHeight - TOOLTIP_PADDING)
    );
  }

  const arrowOffset =
    arrow === "top" || arrow === "bottom"
      ? Math.max(20, Math.min(targetCenterX - x, tooltipWidth - 20))
      : Math.max(20, Math.min(targetCenterY - y, tooltipHeight - 20));

  return { x, y, arrow, arrowOffset };
}

export function OnboardingTooltip({
  targetRef,
  text,
  visible,
  onDismiss,
  className,
}: OnboardingTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const updatePosition = useCallback(() => {
    if (!targetRef.current || !tooltipRef.current) return;
    
    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const newPosition = calculatePosition(targetRect, tooltipRect.width, tooltipRect.height);
    setPosition(newPosition);
  }, [targetRef]);

  useEffect(() => {
    if (visible && !mounted) {
      setMounted(true);
      setIsExiting(false);
    }
  }, [visible, mounted]);

  useEffect(() => {
    if (mounted && targetRef.current) {
      const rafId = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(rafId);
    }
  }, [mounted, updatePosition]);

  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [mounted, updatePosition]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setMounted(false);
      setIsExiting(false);
      onDismiss();
    }, 150);
  }, [onDismiss]);

  useEffect(() => {
    if (!mounted) return;

    const handleClick = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        handleDismiss();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    setTimeout(() => {
      document.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleKeyDown);
    }, 100);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, handleDismiss]);

  if (!mounted) return null;

  const arrowStyles: Record<ArrowPosition, React.CSSProperties> = {
    top: {
      top: -ARROW_SIZE + 1,
      left: position?.arrowOffset ?? 0,
      transform: "translateX(-50%) rotate(45deg)",
      borderTop: "2px solid #F59E0B",
      borderLeft: "2px solid #F59E0B",
    },
    bottom: {
      bottom: -ARROW_SIZE + 1,
      left: position?.arrowOffset ?? 0,
      transform: "translateX(-50%) rotate(45deg)",
      borderBottom: "2px solid #F59E0B",
      borderRight: "2px solid #F59E0B",
    },
    left: {
      left: -ARROW_SIZE + 1,
      top: position?.arrowOffset ?? 0,
      transform: "translateY(-50%) rotate(45deg)",
      borderTop: "2px solid #F59E0B",
      borderLeft: "2px solid #F59E0B",
    },
    right: {
      right: -ARROW_SIZE + 1,
      top: position?.arrowOffset ?? 0,
      transform: "translateY(-50%) rotate(45deg)",
      borderBottom: "2px solid #F59E0B",
      borderRight: "2px solid #F59E0B",
    },
  };

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      data-testid="onboarding-tooltip"
      className={cn(
        "fixed z-[9999] max-w-[280px] rounded-xl px-4 py-3 shadow-lg",
        "bg-amber-50 border-2 border-amber-400",
        isExiting ? "animate-tooltip-exit" : "animate-tooltip-enter",
        !isExiting && "animate-tooltip-float",
        className
      )}
      style={{
        left: position?.x ?? -9999,
        top: position?.y ?? -9999,
        visibility: position ? "visible" : "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute w-3 h-3 bg-amber-50"
        style={position ? arrowStyles[position.arrow] : {}}
      />
      
      <p className="text-amber-900 text-[15px] font-medium leading-snug pr-6">
        {text}
      </p>
      
      <button
        data-testid="tooltip-dismiss-button"
        onClick={handleDismiss}
        className={cn(
          "absolute top-2 right-2 w-6 h-6 flex items-center justify-center",
          "text-amber-600 hover:text-amber-800 transition-colors",
          "rounded-full hover:bg-amber-100"
        )}
        aria-label="Dismiss"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
      </button>
    </div>,
    document.body
  );
}

export default OnboardingTooltip;
