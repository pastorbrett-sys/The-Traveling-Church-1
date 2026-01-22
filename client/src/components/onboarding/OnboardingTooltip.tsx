import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

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

const ARROW_SIZE = 8;

export function OnboardingTooltip({
  targetRef,
  text,
  visible,
  onDismiss,
  position = "below",
  offset = 10,
  dismissOnAnyTap = false,
}: OnboardingTooltipProps) {
  const [coords, setCoords] = useState<{ top: number; left: number; arrowLeft: number } | null>(null);
  const [animationState, setAnimationState] = useState<"hidden" | "entering" | "floating">("hidden");
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate position when visible
  useEffect(() => {
    if (!visible) {
      setAnimationState("hidden");
      setCoords(null);
      return;
    }

    let attempts = 0;
    const maxAttempts = 50;
    
    const checkAndPosition = () => {
      const target = targetRef.current;
      const tooltip = tooltipRef.current;
      
      if (!target || !tooltip) {
        attempts++;
        if (attempts < maxAttempts) {
          requestAnimationFrame(checkAndPosition);
        }
        return;
      }

      const targetRect = target.getBoundingClientRect();
      
      if (targetRect.width === 0 || targetRect.height === 0) {
        attempts++;
        if (attempts < maxAttempts) {
          requestAnimationFrame(checkAndPosition);
        }
        return;
      }

      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const targetCenterX = targetRect.left + targetRect.width / 2;
      let left = targetCenterX - tooltipRect.width / 2;
      
      const padding = 12;
      left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));

      const arrowLeft = targetCenterX - left;

      let top: number;
      if (position === "above") {
        top = targetRect.top - tooltipRect.height - ARROW_SIZE - offset;
      } else {
        top = targetRect.bottom + ARROW_SIZE + offset;
      }

      setCoords({ top, left, arrowLeft });
      
      // Start enter animation
      setTimeout(() => {
        setAnimationState("entering");
        // Switch to floating after bounce completes
        setTimeout(() => {
          setAnimationState("floating");
        }, 500);
      }, 50);
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(checkAndPosition);
    }, 100);

    return () => clearTimeout(timer);
  }, [visible, targetRef, position, offset]);

  // Handle dismiss on any tap
  useEffect(() => {
    if (animationState === "hidden" || !dismissOnAnyTap) return;

    const handleTap = (e: Event) => {
      e.stopPropagation();
      onDismiss();
    };

    const timer = setTimeout(() => {
      document.addEventListener("touchstart", handleTap, { passive: true });
      document.addEventListener("click", handleTap);
    }, 600);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("touchstart", handleTap);
      document.removeEventListener("click", handleTap);
    };
  }, [animationState, dismissOnAnyTap, onDismiss]);

  const isVisible = visible && coords && animationState !== "hidden";

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      data-testid="onboarding-tooltip"
      className={cn(
        "fixed z-[9999] max-w-[280px] rounded-lg px-4 py-3 shadow-lg",
        "bg-amber-500 text-white",
        animationState === "entering" && "animate-tooltip-enter",
        animationState === "floating" && "animate-tooltip-float",
        !isVisible && "opacity-0 pointer-events-none"
      )}
      style={{
        top: coords?.top ?? -9999,
        left: coords?.left ?? -9999,
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          left: coords?.arrowLeft ?? 0,
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderStyle: "solid",
          ...(position === "above"
            ? {
                bottom: -ARROW_SIZE,
                borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
                borderColor: "#f59e0b transparent transparent transparent",
              }
            : {
                top: -ARROW_SIZE,
                borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
                borderColor: "transparent transparent #f59e0b transparent",
              }),
        }}
      />
      
      <p className="text-[15px] font-medium leading-snug">
        {text}
      </p>
    </div>
  );
}

export default OnboardingTooltip;
