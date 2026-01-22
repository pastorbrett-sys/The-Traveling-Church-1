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
const ARROW_SIZE = 8;
const GAP = 10;

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
    } else if (!visible && mounted) {
      setIsExiting(true);
      setTimeout(() => {
        setMounted(false);
        setIsExiting(false);
      }, 150);
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

  if (!mounted) return null;

  // Arrow styles using CSS triangles (proper tooltip arrows)
  const getArrowStyle = (): React.CSSProperties => {
    if (!position) return {};
    
    const base: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      borderStyle: "solid",
    };

    switch (position.arrow) {
      case "top":
        return {
          ...base,
          top: -ARROW_SIZE,
          left: position.arrowOffset,
          transform: "translateX(-50%)",
          borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
          borderColor: "transparent transparent #f59e0b transparent",
        };
      case "bottom":
        return {
          ...base,
          bottom: -ARROW_SIZE,
          left: position.arrowOffset,
          transform: "translateX(-50%)",
          borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
          borderColor: "#f59e0b transparent transparent transparent",
        };
      case "left":
        return {
          ...base,
          left: -ARROW_SIZE,
          top: position.arrowOffset,
          transform: "translateY(-50%)",
          borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`,
          borderColor: "transparent #f59e0b transparent transparent",
        };
      case "right":
        return {
          ...base,
          right: -ARROW_SIZE,
          top: position.arrowOffset,
          transform: "translateY(-50%)",
          borderWidth: `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`,
          borderColor: "transparent transparent transparent #f59e0b",
        };
      default:
        return base;
    }
  };

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      data-testid="onboarding-tooltip"
      className={cn(
        "fixed z-[9999] max-w-[280px] rounded-lg px-4 py-3 shadow-lg",
        "bg-amber-500",
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
      <div style={getArrowStyle()} />
      
      <p className="text-white text-[15px] font-medium leading-snug">
        {text}
      </p>
    </div>,
    document.body
  );
}

export default OnboardingTooltip;
