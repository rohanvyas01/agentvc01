import { useEffect, useRef, useState } from 'react';

interface GestureState {
  isSwipeLeft: boolean;
  isSwipeRight: boolean;
  isSwipeUp: boolean;
  isSwipeDown: boolean;
  isPinching: boolean;
  scale: number;
}

interface UseGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
  preventScroll?: boolean;
}

export const useGestures = (options: UseGesturesOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    threshold = 50,
    preventScroll = false
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [gestureState, setGestureState] = useState<GestureState>({
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeUp: false,
    isSwipeDown: false,
    isPinching: false,
    scale: 1
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchesRef = useRef<TouchList | null>(null);
  const initialDistanceRef = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }

      if (e.touches.length === 1) {
        // Single touch - track for swipe
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      } else if (e.touches.length === 2) {
        // Two touches - track for pinch
        touchesRef.current = e.touches;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistanceRef.current = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        setGestureState(prev => ({ ...prev, isPinching: true }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }

      if (e.touches.length === 2 && touchesRef.current) {
        // Handle pinch gesture
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (initialDistanceRef.current > 0) {
          const scale = currentDistance / initialDistanceRef.current;
          setGestureState(prev => ({ ...prev, scale }));
          onPinch?.(scale);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        // All touches ended
        if (touchStartRef.current && e.changedTouches.length === 1) {
          // Handle swipe gesture
          const touch = e.changedTouches[0];
          const deltaX = touch.clientX - touchStartRef.current.x;
          const deltaY = touch.clientY - touchStartRef.current.y;
          const deltaTime = Date.now() - touchStartRef.current.time;
          
          // Only consider it a swipe if it's fast enough and far enough
          if (deltaTime < 300 && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Horizontal swipe
              if (deltaX > 0) {
                setGestureState(prev => ({ ...prev, isSwipeRight: true }));
                onSwipeRight?.();
              } else {
                setGestureState(prev => ({ ...prev, isSwipeLeft: true }));
                onSwipeLeft?.();
              }
            } else {
              // Vertical swipe
              if (deltaY > 0) {
                setGestureState(prev => ({ ...prev, isSwipeDown: true }));
                onSwipeDown?.();
              } else {
                setGestureState(prev => ({ ...prev, isSwipeUp: true }));
                onSwipeUp?.();
              }
            }
          }
        }

        // Reset state
        touchStartRef.current = null;
        touchesRef.current = null;
        initialDistanceRef.current = 0;
        setGestureState({
          isSwipeLeft: false,
          isSwipeRight: false,
          isSwipeUp: false,
          isSwipeDown: false,
          isPinching: false,
          scale: 1
        });
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, threshold, preventScroll]);

  return { elementRef, gestureState };
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (onRefresh: () => void | Promise<void>) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (element.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const pullDistance = Math.max(0, currentY - startY);
      
      if (pullDistance > 0) {
        e.preventDefault();
        setPullDistance(pullDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      isPulling = false;
      
      if (pullDistance > 80) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setPullDistance(0);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, pullDistance]);

  return { elementRef, isRefreshing, pullDistance };
};