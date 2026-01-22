import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipPosition {
  x: number;
  y: number;
  arrowX: number;
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

export function OnboardingTooltip({
  targetRef,
  text,
  visible,
  onDismiss,
  position = "below",
  offset = 10,
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
    const viewport = { width: window.innerWidth };
    
    // Center tooltip on target horizontally
    const targetCenterX = targetRect.left + targetRect.width / 2;
    let x = targetCenterX - tooltipRect.width / 2;
    
    // Clamp to viewport bounds
    x = Math.max(TOOLTIP_PADDING, Math.min(x, viewport.width - tooltipRect.width - TOOLTIP_PADDING));
    
    // Arrow should point at target center
    const arrowX = targetCenterX - x;
    
    // Position above or below target
    let y: number;
    if (position === "above") {
      // Place tooltip so its bottom edge is `offset` pixels above the target's top edge
      y = targetRect.top - tooltipRect.height - ARROW_SIZE - offset;
    } else {
      // Place tooltip so its top edge is `offset` pixels below the target's bottom edge
      y = targetRect.bottom + ARROW_SIZE + offset;
    }
    
    setTooltipPosition({ x, y, arrowX });
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
      // Initial position calculation
      const rafId = requestAnimationFrame(updatePosition);
      // Also update after a short delay to catch any layout shifts
      const timer = setTimeout(updatePosition, 100);
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timer);
      };
    }
  }, [mounted, updatePosition]);

  useEffect(() => {
    if (!mounted) return;

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
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

  // Arrow CSS triangle styles
  const arrowStyle: React.CSSProperties = position === "above" 
    ? {
        position: "absolute",
        bottom: -ARROW_SIZE,
        left: tooltipPosition?.arrowX ?? 0,
        transform: "translateX(-50%)",
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
        borderColor: "#f59e0b transparent transparent transparent",
      }
    : {
        position: "absolute",
        top: -ARROW_SIZE,
        left: tooltipPosition?.arrowX ?? 0,
        transform: "translateX(-50%)",
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
        borderColor: "transparent transparent #f59e0b transparent",
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
      <div style={arrowStyle} />
      
      <p className="text-white text-[15px] font-medium leading-snug">
        {text}
      </p>
    </div>,
    document.body
  );
}

export default OnboardingTooltip;
