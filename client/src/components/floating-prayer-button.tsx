import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { usePrayerAudioContext } from "@/contexts/prayer-audio-context";

const BUTTON_SIZE = 56;
const EDGE_PADDING = 16;
const FRICTION = 0.92;
const MIN_VELOCITY = 0.5;
const SPRING_STIFFNESS = 0.15;
const SPRING_DAMPING = 0.7;

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface Position {
  x: number;
  y: number;
}

function getStoredCorner(): Corner {
  try {
    const stored = localStorage.getItem("prayer-button-corner");
    if (stored && ["top-left", "top-right", "bottom-left", "bottom-right"].includes(stored)) {
      return stored as Corner;
    }
  } catch {}
  return "bottom-right";
}

function setStoredCorner(corner: Corner) {
  try {
    localStorage.setItem("prayer-button-corner", corner);
  } catch {}
}

function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10) || 0,
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10) || 0,
    left: parseInt(style.getPropertyValue('--sal') || '0', 10) || 0,
    right: parseInt(style.getPropertyValue('--sar') || '0', 10) || 0,
  };
}

function getCornerPosition(corner: Corner, windowWidth: number, windowHeight: number): Position {
  const safeArea = getSafeAreaInsets();
  const safeTop = Math.max(60, safeArea.top + 10);
  const safeBottom = Math.max(120, safeArea.bottom + 40);
  const safeLeft = Math.max(EDGE_PADDING, safeArea.left + EDGE_PADDING);
  const safeRight = Math.max(EDGE_PADDING, safeArea.right + EDGE_PADDING);
  
  switch (corner) {
    case "top-left":
      return { x: safeLeft, y: safeTop };
    case "top-right":
      return { x: windowWidth - BUTTON_SIZE - safeRight, y: safeTop };
    case "bottom-left":
      return { x: safeLeft, y: windowHeight - BUTTON_SIZE - safeBottom };
    case "bottom-right":
    default:
      return { x: windowWidth - BUTTON_SIZE - safeRight, y: windowHeight - BUTTON_SIZE - safeBottom };
  }
}

function determineCorner(x: number, y: number, windowWidth: number, windowHeight: number): Corner {
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  
  if (x < centerX) {
    return y < centerY ? "top-left" : "bottom-left";
  } else {
    return y < centerY ? "top-right" : "bottom-right";
  }
}

function AudioBars() {
  return (
    <div className="flex items-end justify-center gap-[3px] h-5">
      <div 
        className="w-[3px] bg-white rounded-full animate-audio-bar-1"
        style={{ height: "100%" }}
      />
      <div 
        className="w-[3px] bg-white rounded-full animate-audio-bar-2"
        style={{ height: "100%" }}
      />
      <div 
        className="w-[3px] bg-white rounded-full animate-audio-bar-3"
        style={{ height: "100%" }}
      />
    </div>
  );
}

export function FloatingPrayerButton() {
  const { isPlaying } = usePrayerAudioContext();
  const [location, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const velocityRef = useRef<Position>({ x: 0, y: 0 });
  const lastPositionRef = useRef<Position>({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const targetPositionRef = useRef<Position>({ x: 0, y: 0 });
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  
  const isPrayerTimerPage = location === "/prayer-timer";
  const shouldShow = isPlaying && !isPrayerTimerPage;

  useEffect(() => {
    if (shouldShow && !isVisible) {
      const corner = getStoredCorner();
      const pos = getCornerPosition(corner, window.innerWidth, window.innerHeight);
      setPosition(pos);
      setIsVisible(true);
    } else if (!shouldShow && isVisible) {
      setIsVisible(false);
    }
  }, [shouldShow, isVisible]);

  useEffect(() => {
    const handleResize = () => {
      if (isVisible && !isDragging && !isAnimating) {
        const corner = getStoredCorner();
        const pos = getCornerPosition(corner, window.innerWidth, window.innerHeight);
        setPosition(pos);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isVisible, isDragging, isAnimating]);

  const animateToCorner = useCallback((targetX: number, targetY: number) => {
    setIsAnimating(true);
    targetPositionRef.current = { x: targetX, y: targetY };
    
    let currentVelX = velocityRef.current.x;
    let currentVelY = velocityRef.current.y;
    
    const animate = () => {
      setPosition(prev => {
        const dx = targetPositionRef.current.x - prev.x;
        const dy = targetPositionRef.current.y - prev.y;
        
        currentVelX = currentVelX * FRICTION + dx * SPRING_STIFFNESS;
        currentVelY = currentVelY * FRICTION + dy * SPRING_STIFFNESS;
        
        currentVelX *= SPRING_DAMPING;
        currentVelY *= SPRING_DAMPING;
        
        const newX = prev.x + currentVelX;
        const newY = prev.y + currentVelY;
        
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
        const totalVelocity = Math.sqrt(currentVelX * currentVelX + currentVelY * currentVelY);
        
        if (distanceToTarget < 1 && totalVelocity < MIN_VELOCITY) {
          setIsAnimating(false);
          return { x: targetPositionRef.current.x, y: targetPositionRef.current.y };
        }
        
        animationRef.current = requestAnimationFrame(animate);
        return { x: newX, y: newY };
      });
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setIsDragging(true);
    setIsAnimating(false);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = performance.now();
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const totalDragX = e.clientX - dragStartRef.current.x;
    const totalDragY = e.clientY - dragStartRef.current.y;
    const totalDistance = Math.sqrt(totalDragX * totalDragX + totalDragY * totalDragY);
    
    if (totalDistance > 10) {
      hasDraggedRef.current = true;
    }
    
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 1);
    
    const dx = e.clientX - lastPositionRef.current.x;
    const dy = e.clientY - lastPositionRef.current.y;
    
    velocityRef.current = {
      x: (dx / dt) * 16,
      y: (dy / dt) * 16
    };
    
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = now;
    
    setPosition(prev => {
      const safeArea = getSafeAreaInsets();
      const minX = Math.max(EDGE_PADDING, safeArea.left + EDGE_PADDING);
      const maxX = window.innerWidth - BUTTON_SIZE - Math.max(EDGE_PADDING, safeArea.right + EDGE_PADDING);
      const minY = Math.max(60, safeArea.top + 10);
      const maxY = window.innerHeight - BUTTON_SIZE - Math.max(120, safeArea.bottom + 40);
      
      const newX = Math.max(minX, Math.min(maxX, prev.x + dx));
      const newY = Math.max(minY, Math.min(maxY, prev.y + dy));
      return { x: newX, y: newY };
    });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    let velX = velocityRef.current.x;
    let velY = velocityRef.current.y;
    
    const applyMomentum = () => {
      setPosition(prev => {
        velX *= FRICTION;
        velY *= FRICTION;
        
        let newX = prev.x + velX;
        let newY = prev.y + velY;
        
        const safeArea = getSafeAreaInsets();
        const minX = Math.max(EDGE_PADDING, safeArea.left + EDGE_PADDING);
        const maxX = window.innerWidth - BUTTON_SIZE - Math.max(EDGE_PADDING, safeArea.right + EDGE_PADDING);
        const minY = Math.max(60, safeArea.top + 10);
        const maxY = window.innerHeight - BUTTON_SIZE - Math.max(120, safeArea.bottom + 40);
        
        if (newX < minX) { newX = minX; velX = 0; }
        if (newX > maxX) { newX = maxX; velX = 0; }
        if (newY < minY) { newY = minY; velY = 0; }
        if (newY > maxY) { newY = maxY; velY = 0; }
        
        const totalVelocity = Math.sqrt(velX * velX + velY * velY);
        
        if (totalVelocity < MIN_VELOCITY) {
          const corner = determineCorner(newX + BUTTON_SIZE / 2, newY + BUTTON_SIZE / 2, window.innerWidth, window.innerHeight);
          setStoredCorner(corner);
          const targetPos = getCornerPosition(corner, window.innerWidth, window.innerHeight);
          
          setTimeout(() => {
            animateToCorner(targetPos.x, targetPos.y);
          }, 0);
          
          return { x: newX, y: newY };
        }
        
        animationRef.current = requestAnimationFrame(applyMomentum);
        return { x: newX, y: newY };
      });
    };
    
    animationRef.current = requestAnimationFrame(applyMomentum);
  }, [isDragging, animateToCorner]);

  const handleClick = useCallback(() => {
    if (!hasDraggedRef.current) {
      setLocation("/prayer-timer");
    }
  }, [setLocation]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <button
      ref={buttonRef}
      data-testid="floating-prayer-button"
      className={`fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-opacity duration-300 touch-none select-none ${
        isDragging ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-105"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        left: position.x,
        top: position.y,
        backgroundColor: "#c08e00",
        transform: isDragging ? "scale(1.1)" : "scale(1)",
        transition: isDragging ? "none" : "transform 0.2s ease",
        touchAction: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        willChange: isDragging ? "transform, left, top" : "auto",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
    >
      <AudioBars />
    </button>
  );
}
