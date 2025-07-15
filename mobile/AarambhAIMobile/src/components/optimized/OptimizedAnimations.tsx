import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  Animated,
  PanGestureHandler,
  TapGestureHandler,
  PinchGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
  ViewStyle,
  useWindowDimensions,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useRenderPerformance } from '../../utils/performance';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface OptimizedSwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  style?: ViewStyle;
  enabled?: boolean;
}

export const OptimizedSwipeable: React.FC<OptimizedSwipeableProps> = React.memo(({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  style,
  enabled = true,
}) => {
  useRenderPerformance('OptimizedSwipeable');
  
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef({ x: 0, y: 0 });

  const onGestureEvent = useMemo(() => 
    Animated.event(
      [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
      { useNativeDriver: true }
    ),
    [translateX, translateY]
  );

  const onHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      
      // Reset animations
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();

      // Handle swipe gestures
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > swipeThreshold && onSwipeRight) {
          onSwipeRight();
        } else if (translationX < -swipeThreshold && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        if (translationY > swipeThreshold && onSwipeDown) {
          onSwipeDown();
        } else if (translationY < -swipeThreshold && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  }, [swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, translateX, translateY]);

  const animatedStyle = useMemo(() => ({
    transform: [
      { translateX },
      { translateY },
    ],
  }), [translateX, translateY]);

  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-10, 10]}
      activeOffsetY={[-10, 10]}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
});

interface OptimizedPinchZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  onZoomChange?: (scale: number) => void;
  style?: ViewStyle;
}

export const OptimizedPinchZoom: React.FC<OptimizedPinchZoomProps> = React.memo(({
  children,
  minScale = 0.5,
  maxScale = 3,
  onZoomChange,
  style,
}) => {
  useRenderPerformance('OptimizedPinchZoom');
  
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);

  const onPinchGestureEvent = useMemo(() =>
    Animated.event(
      [{ nativeEvent: { scale } }],
      { useNativeDriver: true }
    ),
    [scale]
  );

  const onPinchHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === State.END) {
      const newScale = Math.min(Math.max(lastScale.current * event.nativeEvent.scale, minScale), maxScale);
      
      lastScale.current = newScale;
      scale.setValue(newScale);
      
      onZoomChange?.(newScale);
    }
  }, [minScale, maxScale, onZoomChange, scale]);

  const animatedStyle = useMemo(() => ({
    transform: [{ scale }],
  }), [scale]);

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchHandlerStateChange}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
});

interface OptimizedDraggableProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number) => void;
  bounds?: { left: number; right: number; top: number; bottom: number };
  style?: ViewStyle;
  enabled?: boolean;
}

export const OptimizedDraggable: React.FC<OptimizedDraggableProps> = React.memo(({
  children,
  onDragStart,
  onDragEnd,
  onDrag,
  bounds,
  style,
  enabled = true,
}) => {
  useRenderPerformance('OptimizedDraggable');
  
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef({ x: 0, y: 0 });
  const { width, height } = useWindowDimensions();

  const onGestureEvent = useMemo(() =>
    Animated.event(
      [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
      { 
        useNativeDriver: true,
        listener: (event: any) => {
          const { translationX, translationY } = event.nativeEvent;
          onDrag?.(lastOffset.current.x + translationX, lastOffset.current.y + translationY);
        },
      }
    ),
    [translateX, translateY, onDrag]
  );

  const onHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      onDragStart?.();
    } else if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      
      let newX = lastOffset.current.x + translationX;
      let newY = lastOffset.current.y + translationY;

      // Apply bounds if specified
      if (bounds) {
        newX = Math.min(Math.max(newX, bounds.left), bounds.right);
        newY = Math.min(Math.max(newY, bounds.top), bounds.bottom);
      }

      lastOffset.current = { x: newX, y: newY };
      
      // Animate to final position
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: newX,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: newY,
          useNativeDriver: true,
        }),
      ]).start();

      onDragEnd?.(newX, newY);
    }
  }, [bounds, onDragStart, onDragEnd, translateX, translateY]);

  const animatedStyle = useMemo(() => ({
    transform: [
      { translateX },
      { translateY },
    ],
  }), [translateX, translateY]);

  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
});

interface OptimizedPullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => void;
  refreshing: boolean;
  refreshThreshold?: number;
  style?: ViewStyle;
}

export const OptimizedPullToRefresh: React.FC<OptimizedPullToRefreshProps> = React.memo(({
  children,
  onRefresh,
  refreshing,
  refreshThreshold = 80,
  style,
}) => {
  useRenderPerformance('OptimizedPullToRefresh');
  
  const translateY = useRef(new Animated.Value(0)).current;
  const refreshProgress = useRef(new Animated.Value(0)).current;

  const onGestureEvent = useMemo(() =>
    Animated.event(
      [{ nativeEvent: { translationY: translateY } }],
      { 
        useNativeDriver: true,
        listener: (event: any) => {
          const { translationY } = event.nativeEvent;
          const progress = Math.min(Math.max(translationY / refreshThreshold, 0), 1);
          refreshProgress.setValue(progress);
        },
      }
    ),
    [translateY, refreshProgress, refreshThreshold]
  );

  const onHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      
      if (translationY > refreshThreshold && !refreshing) {
        onRefresh();
      }
      
      // Reset position
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      
      Animated.spring(refreshProgress, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [refreshThreshold, refreshing, onRefresh, translateY, refreshProgress]);

  const animatedStyle = useMemo(() => ({
    transform: [
      { 
        translateY: translateY.interpolate({
          inputRange: [0, refreshThreshold],
          outputRange: [0, refreshThreshold * 0.5],
          extrapolate: 'clamp',
        }),
      },
    ],
  }), [translateY, refreshThreshold]);

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetY={[0, 10]}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
});

// Animation presets for common use cases
export const animationPresets = {
  // Fade animations
  fadeIn: (duration = 300) => ({
    opacity: {
      from: 0,
      to: 1,
      duration,
    },
  }),
  
  fadeOut: (duration = 300) => ({
    opacity: {
      from: 1,
      to: 0,
      duration,
    },
  }),
  
  // Scale animations
  scaleIn: (duration = 300) => ({
    scale: {
      from: 0.8,
      to: 1,
      duration,
    },
  }),
  
  scaleOut: (duration = 300) => ({
    scale: {
      from: 1,
      to: 0.8,
      duration,
    },
  }),
  
  // Slide animations
  slideInFromLeft: (duration = 300) => ({
    translateX: {
      from: -100,
      to: 0,
      duration,
    },
  }),
  
  slideInFromRight: (duration = 300) => ({
    translateX: {
      from: 100,
      to: 0,
      duration,
    },
  }),
  
  slideInFromTop: (duration = 300) => ({
    translateY: {
      from: -100,
      to: 0,
      duration,
    },
  }),
  
  slideInFromBottom: (duration = 300) => ({
    translateY: {
      from: 100,
      to: 0,
      duration,
    },
  }),
};

// Layout animation presets
export const layoutAnimationPresets = {
  easeInEaseOut: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  },
  
  linear: {
    duration: 200,
    create: {
      type: LayoutAnimation.Types.linear,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.linear,
    },
  },
  
  spring: {
    duration: 400,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.7,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.7,
    },
  },
};

// Wrapper component for gesture handler root
export const OptimizedGestureWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {children}
    </GestureHandlerRootView>
  );
};

export default {
  OptimizedSwipeable,
  OptimizedPinchZoom,
  OptimizedDraggable,
  OptimizedPullToRefresh,
  OptimizedGestureWrapper,
  animationPresets,
  layoutAnimationPresets,
};