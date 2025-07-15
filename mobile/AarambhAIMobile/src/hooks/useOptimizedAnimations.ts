import { useRef, useCallback, useMemo } from 'react';
import { Animated, Easing, LayoutAnimation } from 'react-native';
import { useRenderPerformance } from '../utils/performance';

// Hook for optimized fade animations
export const useFadeAnimation = (initialValue = 0, duration = 300) => {
  useRenderPerformance('useFadeAnimation');
  
  const fadeAnim = useRef(new Animated.Value(initialValue)).current;

  const fadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration]);

  const fadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration]);

  const fadeToggle = useCallback(() => {
    const currentValue = fadeAnim._value;
    Animated.timing(fadeAnim, {
      toValue: currentValue === 0 ? 1 : 0,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration]);

  return {
    fadeAnim,
    fadeIn,
    fadeOut,
    fadeToggle,
  };
};

// Hook for optimized scale animations
export const useScaleAnimation = (initialValue = 1, duration = 300) => {
  useRenderPerformance('useScaleAnimation');
  
  const scaleAnim = useRef(new Animated.Value(initialValue)).current;

  const scaleIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const scaleOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.8,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const scalePulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: duration / 2,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, duration]);

  return {
    scaleAnim,
    scaleIn,
    scaleOut,
    scalePulse,
  };
};

// Hook for optimized slide animations
export const useSlideAnimation = (initialValue = 0, duration = 300) => {
  useRenderPerformance('useSlideAnimation');
  
  const slideX = useRef(new Animated.Value(initialValue)).current;
  const slideY = useRef(new Animated.Value(initialValue)).current;

  const slideInFromLeft = useCallback((distance = 100) => {
    slideX.setValue(-distance);
    Animated.timing(slideX, {
      toValue: 0,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [slideX, duration]);

  const slideInFromRight = useCallback((distance = 100) => {
    slideX.setValue(distance);
    Animated.timing(slideX, {
      toValue: 0,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [slideX, duration]);

  const slideInFromTop = useCallback((distance = 100) => {
    slideY.setValue(-distance);
    Animated.timing(slideY, {
      toValue: 0,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [slideY, duration]);

  const slideInFromBottom = useCallback((distance = 100) => {
    slideY.setValue(distance);
    Animated.timing(slideY, {
      toValue: 0,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [slideY, duration]);

  const slideOutToLeft = useCallback((distance = 100) => {
    Animated.timing(slideX, {
      toValue: -distance,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [slideX, duration]);

  const slideOutToRight = useCallback((distance = 100) => {
    Animated.timing(slideX, {
      toValue: distance,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [slideX, duration]);

  return {
    slideX,
    slideY,
    slideInFromLeft,
    slideInFromRight,
    slideInFromTop,
    slideInFromBottom,
    slideOutToLeft,
    slideOutToRight,
  };
};

// Hook for optimized rotation animations
export const useRotationAnimation = (initialValue = 0, duration = 1000) => {
  useRenderPerformance('useRotationAnimation');
  
  const rotateAnim = useRef(new Animated.Value(initialValue)).current;

  const startRotation = useCallback(() => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim, duration]);

  const stopRotation = useCallback(() => {
    rotateAnim.stopAnimation();
  }, [rotateAnim]);

  const rotateOnce = useCallback(() => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });
  }, [rotateAnim, duration]);

  const rotateInterpolation = useMemo(() => 
    rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    }),
    [rotateAnim]
  );

  return {
    rotateAnim,
    rotateInterpolation,
    startRotation,
    stopRotation,
    rotateOnce,
  };
};

// Hook for optimized gesture-based animations
export const useGestureAnimation = () => {
  useRenderPerformance('useGestureAnimation');
  
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const resetTransform = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(rotation, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, [translateX, translateY, scale, rotation]);

  const animateToPosition = useCallback((x: number, y: number) => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: x, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: y, useNativeDriver: true }),
    ]).start();
  }, [translateX, translateY]);

  const animateScale = useCallback((newScale: number) => {
    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const animateRotation = useCallback((degrees: number) => {
    Animated.spring(rotation, {
      toValue: degrees,
      useNativeDriver: true,
    }).start();
  }, [rotation]);

  return {
    translateX,
    translateY,
    scale,
    rotation,
    resetTransform,
    animateToPosition,
    animateScale,
    animateRotation,
  };
};

// Hook for optimized layout animations
export const useLayoutAnimation = () => {
  useRenderPerformance('useLayoutAnimation');

  const configureNext = useCallback((config?: any) => {
    LayoutAnimation.configureNext(
      config || {
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      }
    );
  }, []);

  const easeInEaseOut = useCallback(() => {
    configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  }, [configureNext]);

  const linear = useCallback(() => {
    configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.linear,
      },
    });
  }, [configureNext]);

  const spring = useCallback(() => {
    configureNext({
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
    });
  }, [configureNext]);

  return {
    configureNext,
    easeInEaseOut,
    linear,
    spring,
  };
};

// Hook for optimized staggered animations
export const useStaggeredAnimation = (items: any[], staggerDelay = 100) => {
  useRenderPerformance('useStaggeredAnimation');
  
  const animations = useRef(
    items.map(() => new Animated.Value(0))
  ).current;

  const startStaggered = useCallback(() => {
    const staggeredAnimations = animations.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * staggerDelay,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    );

    Animated.parallel(staggeredAnimations).start();
  }, [animations, staggerDelay]);

  const resetStaggered = useCallback(() => {
    animations.forEach(anim => anim.setValue(0));
  }, [animations]);

  return {
    animations,
    startStaggered,
    resetStaggered,
  };
};

// Hook for optimized sequence animations
export const useSequenceAnimation = () => {
  useRenderPerformance('useSequenceAnimation');

  const createSequence = useCallback((animations: Animated.CompositeAnimation[]) => {
    return Animated.sequence(animations);
  }, []);

  const createParallel = useCallback((animations: Animated.CompositeAnimation[]) => {
    return Animated.parallel(animations);
  }, []);

  const createLoop = useCallback((animation: Animated.CompositeAnimation, iterations = -1) => {
    return Animated.loop(animation, { iterations });
  }, []);

  const createDelay = useCallback((duration: number) => {
    return Animated.delay(duration);
  }, []);

  return {
    createSequence,
    createParallel,
    createLoop,
    createDelay,
  };
};

export default {
  useFadeAnimation,
  useScaleAnimation,
  useSlideAnimation,
  useRotationAnimation,
  useGestureAnimation,
  useLayoutAnimation,
  useStaggeredAnimation,
  useSequenceAnimation,
};