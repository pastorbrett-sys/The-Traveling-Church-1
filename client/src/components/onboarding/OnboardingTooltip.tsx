import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ArrowPosition = "top" | "bottom";

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
  position?: "above" | "below";
  offset?: number;
  dismissOnAnyTap?: boolean;
  className?: string;
}

const TOOLTIP_PADDING = 16;
const ARROW_SIZE = 8;
const BOUNCE_DURATION = 500;

function calculatePosition(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  preferredPosition: "above" | "below",
  gap: number
): TooltipPosition {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const targetCenterX = targetRect.left + targetRect.width / 2;
  
  let x = Math.max(
    TOOLTIP_PADDING,
    Math.min(targetCenterX - tooltipWidth / 2, viewport.width - tooltipWidth - TOOLTIP_PADDING)
  );

  let y: number;
  let arrow: ArrowPosition;

  if (preferredPosition === "above") {
    arrow = "bottom";
    y = targetRect.top - tooltipHeight - gap - ARROW_SIZE;
  } else {
    arrow = "top";
    y = targetRect.bottom + gap + ARROW_SIZE;
  }

  // Calculate arrow offset to point at target center
  const arrowOffset = Math.max(20, Math.min(targetCenterX - x, tooltipWidth - 20));

  return { x, y, arrow, arrowOffset };
}

export function OnboardingTooltip({
  targetRef,
  text,
  visible,
  onDismiss,
  position = "below",
  offset = 8,
  dismissOnAnyTap = false,
  className,
}: OnboardingTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bounceComplete, setBounceComplete] = useState(false);

  const handleDismiss = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setMounted(false);
      setIsExiting(false);
      setBounceComplete(false);
      onDismiss();
    }, 150);
  }, [onDismiss, isExiting]);

  const updatePosition = useCallback(() => {
    if (!targetRef.current || !tooltipRef.current) return;
    
    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const newPosition = calculatePosition(
      targetRect, 
      tooltipRect.width, 
      tooltipRect.height,
      position,
      offset
    );
    setTooltipPosition(newPosition);
  }, [targetRef, position, offset]);

  useEffect(() => {
    if (visible && !mounted) {
      setMounted(true);
      setIsExiting(false);
      setBounceComplete(false);
      const timer = setTimeout(() => {
        setBounceComplete(true);
      }, BOUNCE_DURATION);
      return () => clearTimeout(timer);
    } else if (!visible && mounted && !isExiting) {
      handleDismiss();
    }
  }, [visible, mounted, isExiting, handleDismiss]);

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

  useEffect(() => {
    if (!mounted || !dismissOnAnyTap || isExiting) return;

    const handleTap = () => {
      handleDismiss();
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleTap, { capture: true });
      document.addEventListener("touchend", handleTap, { capture: true });
    }, BOUNCE_DURATION + 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleTap, { capture: true });
      document.removeEventListener("touchend", handleTap, { capture: true });
    };
  }, [mounted, dismissOnAnyTap, isExiting, handleDismiss]);

  if (!mounted) return null;

  const getArrowStyle = (): React.CSSProperties => {
    if (!tooltipPosition) return {};
    
    const base: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      borderStyle: "solid",
    };

    if (tooltipPosition.arrow === "top") {
      return {
        ...base,
        top: -ARROW_SIZE,
        left: tooltipPosition.arrowOffset,
        transform: "translateX(-50%)",
        borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
        borderColor: "transparent transparent #f59e0b transparent",
      };
    } else {
      return {
        ...base,
        bottom: -ARROW_SIZE,
        left: tooltipPosition.arrowOffset,
        transform: "translateX(-50%)",
        borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
        borderColor: "#f59e0b transparent transparent transparent",
      };
    }
  };

  const animationClass = isExiting
    ? "animate-tooltip-exit"
    : bounceComplete
      ? "animate-tooltip-float"
      : "animate-tooltip-enter";

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      data-testid="onboarding-tooltip"
      className={cn(
        "fixed z-[9999] max-w-[280px] rounded-lg px-4 py-3 shadow-lg",
        "bg-amber-500",
        animationClass,
        className
      )}
      style={{
        left: tooltipPosition?.x ?? -9999,
        top: tooltipPosition?.y ?? -9999,
        visibility: tooltipPosition ? "visible" : "hidden",
      }}
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
