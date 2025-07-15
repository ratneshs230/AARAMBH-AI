import React, { useState, useEffect, useRef } from 'react';
import { 
  Image, 
  ImageProps, 
  ImageResizeMode, 
  View, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  ImageStyle,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { imageCacheService } from '../../services/imageCache';
import { COLORS } from '../../constants';
import { useRenderPerformance } from '../../utils/performance';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  placeholder?: string;
  fallback?: string;
  width?: number;
  height?: number;
  resizeMode?: ImageResizeMode;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  showLoader?: boolean;
  loadingSize?: 'small' | 'large';
  fadeDuration?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  priority?: 'high' | 'medium' | 'low';
  lazy?: boolean;
  threshold?: number;
  enableCache?: boolean;
  preload?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  uri,
  placeholder,
  fallback,
  width,
  height,
  resizeMode = 'cover',
  style,
  containerStyle,
  showLoader = true,
  loadingSize = 'small',
  fadeDuration = 300,
  onLoadStart,
  onLoadEnd,
  onError,
  priority = 'medium',
  lazy = false,
  threshold = 100,
  enableCache = true,
  preload = false,
  ...props
}) => {
  useRenderPerformance('OptimizedImage');
  
  const [imageUri, setImageUri] = useState<string>(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const viewRef = useRef<View>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (preload && uri) {
      imageCacheService.cacheImage(uri, { width, height });
    }
  }, [uri, preload, width, height]);

  useEffect(() => {
    if (isInView && uri && !hasError) {
      loadImage();
    }
  }, [isInView, uri, hasError]);

  const loadImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      onLoadStart?.();

      // Set loading timeout
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setHasError(true);
        onError?.({ message: 'Image loading timeout' });
      }, 10000);

      let finalUri = uri;

      // Try to get cached image first
      if (enableCache) {
        const cachedImage = await imageCacheService.getCachedImage(uri);
        if (cachedImage) {
          finalUri = cachedImage.localPath;
        } else {
          // Cache the image for future use
          imageCacheService.cacheImage(uri, { width, height });
        }
      }

      // Preload image to check if it's valid
      Image.prefetch(finalUri)
        .then(() => {
          setImageUri(finalUri);
          setIsLoading(false);
          setHasError(false);
          
          // Clear loading timeout
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          
          // Fade in animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: fadeDuration,
            easing: Easing.ease,
            useNativeDriver: true,
          }).start();
          
          onLoadEnd?.();
        })
        .catch((error) => {
          setIsLoading(false);
          setHasError(true);
          
          // Clear loading timeout
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          
          // Try fallback image
          if (fallback) {
            setImageUri(fallback);
            setHasError(false);
          }
          
          onError?.(error);
        });
    } catch (error) {
      setIsLoading(false);
      setHasError(true);
      onError?.(error);
    }
  };

  // Lazy loading intersection observer simulation
  const handleViewLayout = () => {
    if (lazy && viewRef.current) {
      // Simple lazy loading trigger when component is rendered
      // In a real app, you might want to use a proper intersection observer
      setTimeout(() => {
        setIsInView(true);
      }, 100);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    
    // Clear loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeDuration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
    
    onLoadEnd?.();
  };

  const handleImageError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    
    // Clear loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Try fallback image
    if (fallback && imageUri !== fallback) {
      setImageUri(fallback);
      setHasError(false);
      return;
    }
    
    onError?.(error);
  };

  const renderLoader = () => {
    if (!showLoader || !isLoading) return null;
    
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator 
          size={loadingSize} 
          color={COLORS.primary[600]} 
        />
      </View>
    );
  };

  const renderError = () => {
    if (!hasError) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Ionicons 
          name="image-outline" 
          size={24} 
          color={COLORS.grey[400]} 
        />
      </View>
    );
  };

  const renderPlaceholder = () => {
    if (!placeholder || imageUri) return null;
    
    return (
      <View style={styles.placeholderContainer}>
        <View style={styles.placeholderBox} />
      </View>
    );
  };

  const imageStyle = [
    styles.image,
    {
      width,
      height,
      opacity: isLoading ? 0 : 1,
    },
    style,
  ];

  const containerStyles = [
    styles.container,
    {
      width,
      height,
    },
    containerStyle,
  ];

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View 
      ref={viewRef}
      style={containerStyles}
      onLayout={handleViewLayout}
    >
      {renderPlaceholder()}
      
      {isInView && imageUri && !hasError && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={{ uri: imageUri }}
            style={imageStyle}
            resizeMode={resizeMode}
            onLoad={handleImageLoad}
            onError={handleImageError}
            {...props}
          />
        </Animated.View>
      )}
      
      {renderLoader()}
      {renderError()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: COLORS.grey[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grey[100],
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grey[100],
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderBox: {
    width: '80%',
    height: '80%',
    backgroundColor: COLORS.grey[200],
    borderRadius: 8,
  },
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;